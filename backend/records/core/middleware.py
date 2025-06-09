import threading
 
_user = threading.local()
 
def get_current_user():
    return getattr(_user, 'value', None)
 
class CurrentUserMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
 
    def __call__(self, request):
        # Set the user in thread-local storage for this request
        _user.value = request.user if request.user.is_authenticated else None
        response = self.get_response(request)
        # Clean up after response is returned (optional)
        _user.value = None
        return response
        