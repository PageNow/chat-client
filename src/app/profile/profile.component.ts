import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Auth } from 'aws-amplify';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from "rxjs";

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {

    userUuid: string | null;
    userInfo: any;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private spinner: NgxSpinnerService,
    ) {}

    ngOnInit(): void {
        this.userUuid = this.route.snapshot.paramMap.get('uuid');
        // this.spinner.show();
    }
    
    ngOnDestroy(): void {
        return;
    }
}