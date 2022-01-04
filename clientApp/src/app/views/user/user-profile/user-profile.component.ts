import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { CategoryModel } from 'src/app/infrastructure/models/category.model';
import { GetUserRecipeListItemModel } from 'src/app/infrastructure/models/get-user-recipe-list-item.model';
import { UserInfoModel } from 'src/app/infrastructure/models/user-info.model';
import { AuthService } from 'src/app/infrastructure/services/auth.service';
import { ConfirmationService } from 'src/app/infrastructure/services/confirmation.service';
import { FilesService } from 'src/app/infrastructure/services/files.service';
import { LoaderService } from 'src/app/infrastructure/services/loader.service';
import { RecipesService } from 'src/app/infrastructure/services/recipes.service';
import { UserServiceService } from 'src/app/infrastructure/services/user-service.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css'],
})
export class UserProfileComponent implements OnInit {
  private userId: string;

  public userRecipes: GetUserRecipeListItemModel[] = [];
  public userInfo: UserInfoModel = new UserInfoModel();

  public categories: CategoryModel[] = [];

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private router: Router,
    private loaderService: LoaderService,
    private recipesService: RecipesService,
    private filesService: FilesService,
    private userService: UserServiceService,
    private authService: AuthService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.userId = id;
        this.fetchData(id);
      }
    });

    // TODO do usunięcia jak będą endpointy
    this.userRecipes = [
      {
        title: 'przepis 1',
        authorName: 'Pawelek13',
        recipeId: '35',
        authorId: '43',
        shortDescription: 'jakiś tam krótki opis o przepisie',
        mainImageId: 10,
        rating: 3,
        categoryId: 2,
        createdDate: new Date(),
        mainImageSrc:
          'https://image.ceneostatic.pl/data/products/112187433/i-meal-box-tajski-kurczak-z-ryzem-i-warzywami-360g.jpg',
      },
      {
        title: 'przepis 2',
        authorName: 'Pawelek13',
        recipeId: '45',
        authorId: '45',
        shortDescription: 'jakiś tam krótki opis o przepisie 2',
        mainImageId: 10,
        rating: 3,
        categoryId: 2,
        createdDate: new Date(),
        mainImageSrc:
          'https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.heb.com%2Fproduct-detail%2Fh-e-b-meal-simple-chicken-breast-southwest-marinade-potatoes-green-beans%2F2718585&psig=AOvVaw0EIYo_-5EM-5ZXdk2v12RC&ust=1640959106439000&source=images&cd=vfe&ved=0CAsQjRxqFwoTCJDv_5fXi_UCFQAAAAAdAAAAABAJ',
      },
    ];

    this.userInfo.name = 'Pawelek13';
    this.userInfo.rating = 4.23;
    this.userInfo.views = 100;
    this.userInfo.userId = '2';
  }

  private fetchData = (id: string): void => {
    this.loaderService.show();
    this.userService
      .getUserProfile(id)
      .pipe(
        finalize(() => {
          this.loaderService.hide();
        })
      )
      .subscribe(
        (result) => {
          this.userInfo = result;
        },
        (error) => {}
      );

    this.loaderService.show();
    this.userService
      .getUserRecipes(id)
      .pipe(
        finalize(() => {
          this.setRecipeMainImg();
          this.loaderService.hide();
        })
      )
      .subscribe(
        (result) => {
          this.userRecipes = result;
        },
        (error) => {}
      );

    this.loaderService.show();

    this.recipesService
      .getRecipeCategories()
      .pipe(
        finalize(() => {
          this.loaderService.hide();
        })
      )
      .subscribe(
        (result) => {
          if (result) {
            this.categories = result;
          }
        },
        (error) => {}
      );
  };

  private setRecipeMainImg = (): void => {
    this.userRecipes.forEach((x) => {
      if (x.mainImageId != null) {
        this.filesService
          .getFileById(x.mainImageId)
          .pipe(finalize(() => {}))
          .subscribe(
            (result) => {
              this.setMainImgSrc(x, result.body);
            },
            (error) => {}
          );
      }
    });
  };

  public getCategoryName(id: number): string {
    if (id > this.categories.length || id == 0) {
      return 'brak kategorii';
    }

    return this.categories.filter(function (item) {
      return item.id === id;
    })[0].name;
  }

  private setMainImgSrc = (
    recipe: GetUserRecipeListItemModel,
    file: File | Blob
  ): void => {
    let myReader: FileReader = new FileReader();

    myReader.onloadend = function (e) {
      recipe.mainImageSrc = myReader.result.toString();
    };
    myReader.readAsDataURL(file);
  };
}
