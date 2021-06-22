import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { AuthService } from '../auth/auth.service';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

    userUuid: string | null;

    constructor(
        private route: ActivatedRoute,
        // private authService: AuthService
    ) {}

    ngOnInit(): void {
        this.userUuid = this.route.snapshot.paramMap.get('uuid');
    }
}