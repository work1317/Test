from rest_framework.views import APIView
from rest_framework.response import Response
from core import messages
from core.exceptions import SerializerError
from . import models, serializers, validators
from rest_framework import status



class NotificationAPIView(APIView):
    def get(self, request):
        """
        Return all notifications
        """
        context = {
            "success": 1,
            "message": messages.DATA_RETRIEVED,
            "data": {}
        }
        try:
            notifications = models.Notification.objects.all().order_by('-created_at')
            serializer = serializers.NotificationSerializer(notifications, many=True, context={"request": request})
            context['data'] = serializer.data
        except Exception as e:
            context['success'] = 0
            context['message'] = str(e)
        return Response(context)

    def post(self, request):
        """
        Create a notification manually if needed
        """
        context = {
            "success": 1,
            "message": messages.DATA_SAVED,
            "data": {}
        }
        try:
            validator = validators.NotificationValidator(data=request.data)

            if not validator.is_valid():
                raise SerializerError(validator.errors)

            req_params = validator.validated_data

            notification = models.Notification(
                title=req_params['title'],
                message=req_params['message'],
                is_read=req_params.get('is_read', False)
            )
            notification.clean()
            notification.save()

            serializer = serializers.NotificationSerializer(notification, context={"request": request})
            context['data'] = serializer.data

        except SerializerError as e:
            context['success'] = 0
            context['message'] = str(e)
        except Exception as e:
            context['success'] = 0
            context['message'] = str(e)
        return Response(context)


class MarkAsReadView(APIView):
    def post(self, request, pk):
        """
        Marks a notification as read
        """
        context = {
            "success": 1,
            "message": messages.DATA_UPDATED,
            "data": {}
        }
        try:
            notification = models.Notification.objects.get(pk=pk)
            notification.is_read = True
            notification.save()
            context['message'] = "Notification marked as read."
        except models.Notification.DoesNotExist:
            context['success'] = 0
            context['message'] = "Notification not found."
            return Response(context, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            context['success'] = 0
            context['message'] = str(e)
            return Response(context, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response(context, status=status.HTTP_200_OK)