from django.http import JsonResponse, HttpResponse, Http404
from rest_framework import status, serializers
from rest_framework.response import Response
from rest_framework.views import APIView

from recipesAPI.recipes.models import Recipe
from recipesAPI.recipes.serializers import RecipeSerializer
from recipesAPI.recipesBackend.models import Message


class RecipeDetails(APIView):

    def get_message_object(self, pk):
        try:
            return Message.objects.get(pk=pk)
        except Message.DoesNotExist:
            raise Http404

    def get_recipe_object(self, pk):
        try:
            return Recipe.objects.get(pk=pk)
        except Recipe.DoesNotExist:
            raise Http404

    def get(self, request, pk, format=None):
        try:
            recipe = self.get_recipe_object(pk)
        except Http404 as http404Er:
            return JsonResponse({'isUpdated': False, 'errorMessage': http404Er}, safe=False,
                                status=status.HTTP_404_NOT_FOUND)
        recipe_serializer = RecipeSerializer(recipe, data=request.data)
        try:
            if recipe_serializer.is_valid(raise_exception=True):
                recipe_serializer.views += 1
                recipe_serializer.save()
                recipe_modified = self.get_recipe_object(pk)
                recipe_serializer_modified = RecipeSerializer(recipe, data=request.data)
                messsage = self.get_message_object(pk)
                # TODO: Get list of messages and attach to recipe, calculate mean of recipe from comments
                return JsonResponse(recipe_serializer_modified.data, safe=False, status=status.HTTP_200_OK)
        except serializers.ValidationError as valEr:
            return JsonResponse({'isUpdated': False, 'errorMessage': valEr.detail}, safe=False,
                                status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk, format=None):
        try:
            recipe = self.get_recipe_object(pk)
        except Http404 as http404Er:
            return JsonResponse({'isUpdated': False, 'errorMessage': http404Er}, safe=False,
                                status=status.HTTP_404_NOT_FOUND)
        recipe_serializer = RecipeSerializer(recipe, data=request.data)
        try:
            if recipe_serializer.is_valid(raise_exception=True):
                recipe_serializer.save()
                return JsonResponse({'isUpdated': True, 'errorMessage': ""}, safe=False, status=status.HTTP_200_OK)
        except serializers.ValidationError as valEr:
            return JsonResponse({'isUpdated': False, 'errorMessage': valEr.detail}, safe=False,
                                status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk, format=None):
        try:
            user = self.get_recipe_object(pk)
        except Http404 as http404Er:
            return JsonResponse({'isUpdated': False, 'errorMessage': http404Er}, safe=False,
                                status=status.HTTP_404_NOT_FOUND)
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class RecipeInit(APIView):

    def recipe_exists_by_name(self, name):
        return Recipe.objects.filter(username=name).exists()

    def post(self, request, pk, format=None):
        recipe_serializer = RecipeSerializer(data=request.data)
        try:
            if recipe_serializer.is_valid(raise_exception=True):
                if not self.recipe_exists_by_name(recipe_serializer.validated_data['username']):
                    recipe_serializer.save()
                    return JsonResponse({'isCreated': True, 'errorMessage': ""}, safe=False,
                                        status=status.HTTP_201_CREATED)
                return JsonResponse({'isCreated': False, 'errorMessage': recipe_serializer.errors},
                                    status=status.HTTP_400_BAD_REQUEST)
        except serializers.ValidationError as valEr:
            return JsonResponse({'isCreated': False, 'errorMessage': valEr.detail}, safe=False,
                                status=status.HTTP_400_BAD_REQUEST)
