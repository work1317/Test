from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from core import messages 
from . import models, serializers, validators
from core.exceptions import SerializerError  
from rest_framework.views import APIView
from rest_framework.response import Response
from . import models, serializers
from django.urls import reverse
from django.shortcuts import get_object_or_404,HttpResponse
from rest_framework import status
import os
from django.http import FileResponse,Http404

# Create your views here.

class LabInvoiceCreateAPIView(APIView):
    def post(self, request):
        context = {
            "success": 1,
            "message": messages.DATA_SAVED,
            "data": {}
        }
        try:
            validator = validators.LabInvoiceValidator(data=request.data)
            if not validator.is_valid():
                raise SerializerError(validator.errors)

            req_params = validator.validated_data

            lab_invoice = models.LabInvoice.objects.create(
                patient_name=req_params['patient_name'],
                test_name=req_params['test_name'],
                amount=req_params['amount'],
                date=req_params['date'],
                status=req_params['status'],
            )

            serialized = serializers.LabInvoiceSerializer(lab_invoice, context={"request": request})
            context["data"] = serialized.data

        except SerializerError as e:
            context["success"] = 0
            context["message"] = str(e)
        except Exception as e:
            context["success"] = 0
            context["message"] = str(e)

        return Response(context)


class LabInvoiceListAPIView(APIView):
    def get(self, request):
        invoices = models.LabInvoice.objects.all()
        simplified_data = []

        for invoice in invoices:
            detail_url = f"/labs/lab_tests/{invoice.pk}/"  # Avoid reverse() error
            simplified_data.append({
                "patient_name": invoice.patient_name,
                "test_name": invoice.test_name,
                "amount": invoice.amount,
                "status": invoice.status.lower(),  # e.g., "pending"
                "date": invoice.date,
                "action": detail_url
            })

        return Response({
            "success": 1,
            "message": "Lab Invoices Fetched Successfully",
            "data": simplified_data
        })


class LabInvoiceDetailAPIView(APIView):
    def get(self, request, pk):
        invoice = get_object_or_404(models.LabInvoice, pk=pk)

        data = {
            "test_name": invoice.test_name,
            "amount": invoice.amount,
            "status": invoice.status.lower(),
            "date": invoice.date.strftime("%d-%b-%Y")
        }

        # If "download" parameter is passed, generate and download the file
        if request.query_params.get("download") == "true":
            content = (
                f"Lab Invoice Detail\n\n"
                f"Test Name : {data['testname']}\n"
                f"Amount    : {data['amount']}\n"
                f"Status    : {data['status']}\n"
                f"Date      : {data['date']}\n"
            )

            response = HttpResponse(content, content_type='text/plain')
            response['Content-Disposition'] = f'attachment; filename="LabInvoice_{invoice.pk}.txt"'
            return response

        # Default: return data as JSON
        return Response({
            "success": 1,
            "message": "Lab Invoice Detail Fetched Successfully",
            "data": data
        }, status=status.HTTP_200_OK)


class LabTestCreateAPIView(APIView):
    def post(self, request):
        context = {
            "success": 1,
            "message": messages.DATA_SAVED,
            "data": {}
        }
        try:
            validator = validators.LabTestValidator(data=request.data)
            if not validator.is_valid():
                raise SerializerError(validator.errors)

            req_params = validator.validated_data

            lab_test = models.LabTest.objects.create(
                patient_id=req_params['patient_id'],
                patient_name=req_params['patient_name'],
                requested_test=req_params['requested_test'],
                requested_by=req_params['requested_by'],
                request_date=req_params['request_date'],
                priority=req_params['priority'],
                status=req_params['status'],
                notes=req_params.get('notes'),

                user_id=req_params['user_id'],
                username=req_params['username'],

                test_date=req_params.get('test_date'),
                test_time=req_params.get('test_time'),
                summary=req_params.get('summary'),
                test_type=req_params.get('test_type'),
                flag=req_params.get('flag', False),
                upload=req_params.get('upload')
            )

            serialized = serializers.LabTestSerializer(lab_test, context={"request": request})
            context["data"] = serialized.data

        except SerializerError as e:
            context["success"] = 0
            context["message"] = str(e)
        except Exception as e:
            context["success"] = 0
            context["message"] = str(e)

        return Response(context)        


class LabTestListAPIView(APIView):
    def get(self, request):
        # Fetch all lab tests from the database
        tests = models.LabTest.objects.all()

        # Serialize the data
        serialized = serializers.LabTestSerializer(tests, many=True, context={"request": request})

        # Prepare the data to return only the requested fields in the specific format
        simplified_data = []
        for test in serialized.data:
            # Build the URL to the detail view
            detail_url =  test['id']

            # Add the test data in the requested format
            simplified_data.append({
                "patient_name": test['patient_name'],
                "requested_test": test['requested_test'],
                "test_type": test['test_type'],
                "test_date": test['test_date'],
                "status": test['status'],
                "action": detail_url  # The dynamic URL for the action
            })

        return Response({
            "success": 1,
            "message": "Lab Tests Fetched Successfully",
            "data": simplified_data
        })


class LabTestDetailAPIView(APIView):
    def get(self, request, pk):
        test = get_object_or_404(models.LabTest, pk=pk)

        data = {
            "doctor": test.requested_by,
            "test_type": test.test_type,
            "summary": test.summary,
            "result": os.path.basename(test.upload.name) if test.upload else None
        }

        return Response({
            "success": 1,
            "message": "Lab Test Details Fetched Successfully",
            "data": data
        })


class LabTestDownloadAPIView(APIView):
    def get(self, request, pk):
        test = get_object_or_404(models.LabTest, pk=pk)

        if test.upload and os.path.exists(test.upload.path):
            response = FileResponse(open(test.upload.path, 'rb'), as_attachment=True)
            response['Content-Disposition'] = f'attachment; filename="{os.path.basename(test.upload.name)}"'
            return response
        else:
            return Response({
                "success": 0,
                "message": "No file available for download or file does not exist.",
                "data": {}
            }, status=status.HTTP_404_NOT_FOUND)
