import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { ChatComponent } from "./chat.component";

const chatRoutes: Routes = [
    { path: '', component: ChatComponent }
];

@NgModule({
    imports: [RouterModule.forChild(chatRoutes)],
    exports: [RouterModule]
})
export class ChatRoutingModule { }
