from rest_framework import serializers

class NotificationValidator(serializers.Serializer):
    title = serializers.CharField(required=True, error_messages={
        "required": "Title is a required field.",
        "blank": "Title cannot be blank."
    })
    message = serializers.CharField(required=True, error_messages={
        "required": "Message is a required field.",
        "blank": "Message cannot be blank."
    })
    is_read = serializers.BooleanField(
        required=False,
        default=False,  # Default to False when not provided
        error_messages={
            "invalid": "is_read must be a boolean value (true or false)."
        }
    )
    created_at = serializers.DateTimeField(required=False, error_messages={
        "invalid": "Invalid date format for created_at."
    })
