from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from core import messages 
from . import models, serializers, validators
from core.exceptions import SerializerError  
from rest_framework.views import APIView
from rest_framework.response import Response
from . import models, serializers
from datetime import timedelta
from django.utils import timezone
from django.db.models import F, Sum, ExpressionWrapper, DecimalField
from django.db import transaction
from django.core.cache import cache
from datetime import date
from decimal import Decimal
from dateutil.relativedelta import relativedelta
from django.db.models import Q, F, Sum, ExpressionWrapper, DecimalField

# Create your views here.

class MedicationCreateAPIView(APIView):
    def post(self,request):
        context={
            "success" : 1,
            "message" : messages.DATA_SAVED,
            "data" : {}
        }
        try:
            validator = validators.MedicationValidator(data=request.data)
            if not validator.is_valid():
                raise SerializerError(validator.errors)
            
            req_params = validator.validated_data

            medication = models. Medication.objects.create(
                medication_name=req_params['medication_name'],
                category=req_params['category'],
                manufacturer=req_params['manufacturer'],
                strength=req_params['strength'],
                stock_quantity=req_params.get('stock_quantity'),
                unit_price=req_params.get('unit_price'),
                mrp=req_params.get('mrp'),
                expiry_date=req_params.get('expiry_date'),
                description=req_params.get('description'),
                batch_no=req_params.get('batch_no'),
            )
            serialized = serializers.MedicationSeralizer(medication,context={"request": request})
            context["data"] = serialized.data
        except SerializerError as e:
            context["success"] = 0
            context["message"] = str(e)
        except Exception as e:
            context["success"] = 0
            context["message"] = str(e)
        return Response(context)


class MedicationCombinedAPIView(APIView):
    def get(self, request):
        context = {
            "success": 1,
            "message": "Medicines and Status Fetched Successfully",
            "data": {
                "medicines": [],
                "status": {}
            }
        }

        try:
            # 📅 Calculate date boundaries
            today = timezone.now().date()
            six_months_later = today + relativedelta(months=6)
            four_months_ago = timezone.now() - timedelta(days=120)

            # Fetch & serialize
            medicines = models.Medication.objects.all()
            serializer = serializers.MedicationSeralizer(medicines, many=True)
            context["data"]["medicines"] = serializer.data

            # Stats
            inventory_count = medicines.count()

            low_stock_count = sum(
                1 for m in medicines
                if m.initial_stock and m.stock_quantity is not None
                   and m.initial_stock > 0
                   and m.stock_quantity < 0.4 * m.initial_stock
            )

            nearing_expiry_count = medicines.filter(
                expiry_date__isnull=False,
                expiry_date__gte=today,
                expiry_date__lte=six_months_later
            ).count()

            stagnant_drugs_count = medicines.filter(
                updated_at__lte=four_months_ago
            ).count()

            # ✅ UPDATED prescription_pending_count to check NULL or EMPTY description

            prescription_pending_count = medicines.filter(
                stock_quantity__isnull=True,
                unit_price__isnull=True,
                mrp__isnull=True,
                expiry_date__isnull=True,
            ).filter(
                Q(description__isnull=True) | Q(description=''),
                medication_name__isnull=False
            ).exclude(
                medication_name='',
                category='',
                manufacturer='',
                strength='',
                batch_no=''
            ).count()
            total_value = medicines.exclude(
                mrp__isnull=True,
                stock_quantity__isnull=True
            ).annotate(
                total=ExpressionWrapper(
                    F('mrp') * F('stock_quantity'),
                    output_field=DecimalField(max_digits=20, decimal_places=2)
                )
            ).aggregate(total_mrp=Sum('total'))['total_mrp'] or 0

            thirty_days_from_now = today + timedelta(days=30)
            upcoming_dues = models.AddNewTransaction.objects.filter(
                due_date__range=[today, thirty_days_from_now],
                due_date_amount__gt=0
            ).count()

            context["data"]["status"] = {
                "Inventory": inventory_count,
                "LowStockAlert": low_stock_count,
                "NearingExpiry": nearing_expiry_count,
                "StagnantDrugs": stagnant_drugs_count,
                "PrescriptionPending": prescription_pending_count,
                "Value": float(total_value),
                "UpcomingSupplierDues": upcoming_dues
            }

        except Exception as e:
            context["success"] = 0
            context["message"] = str(e)

        return Response(context)


class MedicationUpdateAPIView(APIView):
    def get(self, request, pk=None):
        """Fetch existing medication details before updating."""
        context = {
            "success": 1,
            "message": messages.DATA_FOUND,
            "data": {}
        }
        try:
            medication = models.Medication.objects.get(id=pk)
            serializer = serializers.MedicationSeralizer(medication)
            context['data'] = serializer.data

        except models.Medication.DoesNotExist:
            context['success'] = 0
            context['message'] = "Medication Not Found"

        except Exception as e:
            context['success'] = 0
            context['message'] = str(e)

        return Response(context)

    def put(self, request, pk=None):
        """Update medication details."""
        context = {
            "success": 1,
            "message": messages.DATA_UPDATED,
            "data": {}
        }
        try:
            medication = models.Medication.objects.get(id=pk)

            # Serialize current data
            old_serializer = serializers.MedicationSeralizer(medication)
            current_data = old_serializer.data

                        # Get new data from request
            medication_name = request.data.get('medication_name', medication.medication_name)
            batch_no = request.data.get('batch_no', medication.batch_no)
 
            # Check for duplicate medicine with same name and batch_no but different ID
            if models.Medication.objects.filter(medication_name=medication_name, batch_no=batch_no).exclude(id=pk).exists():
                context['success'] = 0
                context['message'] = "Medication with the same name and batch number cannot be updated."
                return Response(context)

            # Get new data from request
            medication_name = request.data.get('medication_name', medication.medication_name)
            batch_no = request.data.get('batch_no', medication.batch_no)

            # Check for duplicate medicine with same name and batch_no but different ID
            if models.Medication.objects.filter(medication_name=medication_name, batch_no=batch_no).exclude(id=pk).exists():
                context['success'] = 0
                context['message'] = "Medication with the same name and batch number cannot be updated."
                return Response(context)
            # Use same serializer for updating
            serializer = serializers.MedicationSeralizer(
                medication, data=request.data, partial=True
            )

            if not serializer.is_valid():
                raise SerializerError(serializer.errors)

            with transaction.atomic():
                serializer.save()
                medication.refresh_from_db()

            context['message'] = "Medication details updated successfully"
            context['previous_data'] = current_data
            context['updated_data'] = serializer.data

            cache.clear()

        except models.Medication.DoesNotExist:
            context['success'] = 0
            context['message'] = "Medication Not Found"

        except SerializerError as e:
            context['success'] = 0
            context['message'] = str(e)

        except Exception as e:
            context['success'] = 0
            context['message'] = str(e)

        return Response(context)


class AddSupplierCreateAPIView(APIView):
    def post(self, request):
        context = {
            "success": 1,
            "message": "Supplier added successfully.",
            "data": {}
        }
        try:
            validator = validators.AddSupplierValidator(data=request.data)
            if not validator.is_valid():
                raise SerializerError(validator.errors)
            
            req_params = validator.validated_data

            supplier = models.AddSupplier.objects.create(
                name=req_params['name'],
                email=req_params['email'],
                phone=req_params['phone'],
                products=req_params['products'],
            )
            serialized = serializers.AddSupplierSerializer(supplier, context={"request": request})
            context["data"] = serialized.data

        except SerializerError as e:
            context["success"] = 0
            context["message"] = str(e)
        except Exception as e:
            context["success"] = 0
            context["message"] = str(e)

        return Response(context)


class AddSupplierListAPIView(APIView):
    def get(self, request):
        context = {
            "success": 1,
            "message": "Suppliers fetched successfully.",
            "data": []
        }
        try:
            suppliers = models.AddSupplier.objects.all()
            supplier_data = []

            for supplier in suppliers:
                total_balance = models.AddNewTransaction.objects.filter(
                    supplier=supplier
                ).aggregate(total=Sum('net_change'))['total'] or Decimal('0.00')
 
                supplier_data.append({
                    "id": supplier.id,
                    "name": supplier.name,
                    "email": supplier.email,
                    "phone": supplier.phone,
                    "supplied_products": supplier.products.split(','),  # Converting products to a list
                    "balance":total_balance,
                    "actions": f"/supplier/{supplier.id}/view"  # URL for viewing details
                })
            
            context["data"] = supplier_data

        except Exception as e:
            context["success"] = 0
            context["message"] = str(e)

        return Response(context)


class AddSupplierDetailAPIView(APIView):
    def get(self, request, supplier_id):
        context = {
            "success": 1,
            "message": "Supplier details fetched successfully.",
            "data": {}
        }

        try:
            supplier = models.AddSupplier.objects.get(id=supplier_id)
            txs = models.AddNewTransaction.objects.filter(supplier=supplier).order_by('date', 'id')

            running = Decimal('0')
            txn_list = []

            for tx in txs:
                running += tx.net_change
            
                # Set debit and credit to "-" by default
                debit = "-"
                credit = "-"
            
                # Show due_date_amount in the correct column based on transaction_type
                if tx.transaction_type == "debit":
                    debit = float(tx.due_date_amount or 0.0)
                elif tx.transaction_type == "credit":
                    credit = float(tx.due_date_amount or 0.0)
            
                txn_list.append({
                    "date": tx.date,
                    "description": tx.description,
                    "amount": float(tx.amount),  # original transaction amount
                    "debit": debit,
                    "credit": credit,
                    "payment_mode": tx.get_payment_mode_display(),
                    "due_on": tx.due_date,
                    "due_date_amount": float(tx.due_date_amount or Decimal('0.0')),
                    "overdue_by_days": self.get_overdue_by_days(tx),
                    "balance": float(tx.net_change),
                    "running_balance": float(running)
                })
                        
            context["data"] = {
                "name": supplier.name,
                "email": supplier.email,
                "phone": supplier.phone,
                "supplied_products": supplier.products.split(',') if supplier.products else [],
                "current_balance": float(running),  # Final cumulative balance
                "transactions": txn_list
            }

        except models.AddSupplier.DoesNotExist:
            context["success"] = 0
            context["message"] = "Supplier not found."
        except Exception as e:
            context["success"] = 0
            context["message"] = str(e)

        return Response(context)

    def get_overdue_by_days(self, transaction):
        if transaction.due_date:
            today = date.today()
            delta = (today - transaction.due_date).days
            return delta if delta > 0 else 0
        return "-"


class AddNewTransactionCreateAPIView(APIView):
    def post(self, request):
        context = {
            "success": 1,
            "message": "Transaction added successfully.",
            "data": {}
        }
        try:
            validator = validators.AddNewTransactionValidator(data=request.data)
            if not validator.is_valid():
                raise SerializerError(validator.errors)
 
            req_params = validator.validated_data
            supplier = models.AddSupplier.objects.get(id=req_params['supplier'].id)
 
            # Save transaction using model logic (which calculates balance_amount in save())
            transaction = models.AddNewTransaction.objects.create(
                supplier=supplier,
                date=req_params.get('date', timezone.now().date()),
                description=req_params['description'],
                amount=req_params['amount'],
                due_date=req_params.get('due_date'),
                due_date_amount=req_params.get('due_date_amount'),
                transaction_type=req_params['transaction_type'],
                payment_mode=req_params['payment_mode']
            )
 
            serialized = serializers.AddNewTransactionSerializer(transaction, context={"request": request})
            context["data"] = serialized.data
 
        except models.AddSupplier.DoesNotExist:
            context["success"] = 0
            context["message"] = "Supplier not found."
        except SerializerError as e:
            context["success"] = 0
            context["message"] = str(e)
        except Exception as e:
            context["success"] = 0
            context["message"] = str(e)
 
        return Response(context)


class AddNewTransactionHistoryAPIView(APIView):
    def get(self, request, supplier_id):
        context = {
            "success": 1,
            "message": "Transaction history fetched successfully.",
            "data": []
        }
        try:
            supplier = models.AddSupplier.objects.get(id=supplier_id)
            transactions = models.AddNewTransaction.objects.filter(supplier=supplier)
 
            filter_type = request.GET.get('transaction_type', None)
            if filter_type:
                transactions = transactions.filter(transaction_type=filter_type)
 
            serializer = serializers.AddNewTransactionSerializer(transactions, many=True, context={"request": request})
            context["data"] = serializer.data
 
        except models.AddSupplier.DoesNotExist:
            context["success"] = 0
            context["message"] = "Supplier not found."
        except Exception as e:
            context["success"] = 0
            context["message"] = str(e)
 
        return Response(context)
    
    
