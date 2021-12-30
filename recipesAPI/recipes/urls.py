from django.urls import path
from recipes import views

from recipesAPI.recipes import views

urlpatterns = [
    path('api/recipes/get-recipe/<int:pk>', views.RecipeDetails.as_view()),
    path('api/recipes/delete-recipe/<int:pk>', views.RecipeDetails.as_view()),
    path('api/recipes/create-recipe/',        views.RecipeInit.as_view()),
    path('api/recipes/modify-recipe/<int:pk>', views.RecipeDetails.as_view()),
    path('get-recipe/<int:id>/', views.get_recipe),
    path('create-recipe/', views.create_recipe),
    path('upload-main-image/<int:id>/', views.upload_main_image),
    path('edit-recipe/<int:id>/', views.edit_recipe),
    path('delete-recipe/<int:id>/', views.delete_recipe),
    path('get-all/', views.get_all),
    path('get-image/<int:id>/', views.get_image),
    path('create-comment/<int:id>/', views.create_comment),
]