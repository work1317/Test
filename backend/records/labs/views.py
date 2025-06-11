from django.shortcuts import render, get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.http import HttpResponse, FileResponse
from core import messages
from . import models, serializers, validators
from core.exceptions import SerializerError
from datetime import datetime
import os
from datetime import date
from rest_framework.parsers import MultiPartParser, FormParser

# Create the views here

class LabInvoiceCreateAPIView(APIView):
    def post(self, request):
        context = {
            "success": 1,
            "message": "Data saved successfully.",
            "data": {}
        }
        try:
            # Validate input data (including patient name)
            validator = validators.LabInvoiceValidator(data=request.data)
            if not validator.is_valid():
                raise SerializerError(validator.errors)

            req_params = validator.validated_data

            # Fetch patient object by patient_name (from validated_data)
            patient_id = req_params['patient_id']
            try:
                patient = models.Patient.objects.get(patient_id=patient_id)
            except models.Patient.DoesNotExist:
                context["success"] = 0
                context["message"] = f"Patient with ID '{patient_id}' does not exist."
                return Response(context, status=status.HTTP_400_BAD_REQUEST)
            
            # Create LabInvoice instance
            lab_invoice = models.LabInvoice.objects.create(
                patient=patient,
                testname=req_params['testname'],
                amount=req_params['amount'],
                status=req_params.get('status', models.LabInvoice.StatusChoices.PENDING),
                date=req_params.get('date', date.today())
            )

            # Serialize the saved object to return
            serialized = serializers.LabInvoiceSerializer(lab_invoice, context={"request": request})
            context["data"] = serialized.data

        except SerializerError as e:
            context["success"] = 0
            context["message"] = str(e)
            return Response(context, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            context["success"] = 0
            context["message"] = f"An unexpected error occurred: {str(e)}"
            return Response(context, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(context, status=status.HTTP_201_CREATED)


class LabInvoiceListAPIView(APIView):
    def get(self, request):
        invoices = models.LabInvoice.objects.select_related('patient').all()
        simplified_data = []

        for invoice in invoices:
            simplified_data.append({
                "patient_name": invoice.patient.patient_name,
                "testname": invoice.testname,
                "amount": str(invoice.amount),
                "status": invoice.status.lower(),
                "date": invoice.date.strftime("%Y-%m-%d"),
                "action": request.build_absolute_uri(f"/labs/invoice_lists/{invoice.id}/")
            })

        return Response({
            "success": 1,
            "message": "Lab Invoices Fetched Successfully",
            "data": simplified_data
        })


class LabInvoiceDetailAPIView(APIView):
    def get(self, request, pk):
        try:
            invoice = models.LabInvoice.objects.select_related('patient').get(pk=pk)

            data = {
                "patient": invoice.patient.patient_name,
                "testname": invoice.testname,
                "amount": str(invoice.amount),
                "status": invoice.status,
                "date": invoice.date.strftime("%Y-%m-%d")
            }

            return Response({
                "success": 1,
                "message": "Lab Invoice Details Fetched Successfully",
                "data": data
            })

        except models.LabInvoice.DoesNotExist:
            return Response({
                "success": 0,
                "message": "Lab Invoice not found"
            }, status=status.HTTP_404_NOT_FOUND)


class LabTestCreateAPIView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    def post(self, request):
        context = {
            "success": 1,
            "message": "Data saved successfully.",
            "data": {}
        }
        try:
            validator = validators.LabTestValidator(data=request.data)
            if not validator.is_valid():
                raise SerializerError(validator.errors)

            req_params = validator.validated_data
            patient = get_object_or_404(models.Patient, patient_id=req_params['patient'])

            lab_test = models.LabTest.objects.create(
                patient=patient,
                request_by=request.user if request.user.is_authenticated else None,
                requested_test=req_params['requested_test'],
                request_date=req_params['request_date'],
                priority=req_params['priority'],
                status=req_params['status'],
                notes=req_params.get('notes'),
                test_date=req_params['test_date'],
                test_time=datetime.now().time(),
                summary=req_params.get('summary'),
                test_type=req_params['test_type'],
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
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        tests = models.LabTest.objects.select_related('patient').all()
        simplified_data = []

        for test in tests:
            attachment_url = (
                request.build_absolute_uri(test.upload.url).rstrip('/')
                if test.upload else None
            )

            simplified_data.append({
                "patient_name": test.patient.patient_name,
                "test_name": test.requested_test,
                "date": test.request_date.strftime("%Y-%m-%d"),
                "status": test.status,
                "action": test.id,
                "patient_id": test.patient.patient_id,
                "result_download_url": attachment_url
            })

        return Response({
            "success": 1,
            "message": "Lab Tests Fetched Successfully",
            "data": simplified_data
        })


class LabTestDetailAPIView(APIView):
    def get(self, request, pk):
        test = get_object_or_404(models.LabTest, pk=pk)

        # Get doctor name from the patient linked to this test
        doctor_name = "N/A"
        if test.patient and test.patient.doctor:
            doctor_name = test.patient.doctor.d_name  # Use d_name field directly

        attachment_url = (
            request.build_absolute_uri(test.upload.url)
            if test.upload else None
        )

        data = {
            "doctor": doctor_name,
            "test_type": test.test_type,
            "summary": test.summary,
            "test_date": test.test_date,
            "result_filename": os.path.basename(test.upload.name) if test.upload else None,
            "result_download_url": attachment_url
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
        
        