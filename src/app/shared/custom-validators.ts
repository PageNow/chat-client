import {AbstractControl, ValidationErrors, ValidatorFn} from '@angular/forms';

export function passwordValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const value = control.value;
        if (value.toLowerCase() === value) {
            return { passwordUppercaseError: true };
        }
        if (value.toUpperCase() === value) {
            return { passwordLowercaseError: true };
        }
        if (!/\d/.test(value)) {
            return { passwordNumberError: true };
        }
        if (value.length < 8) {
            return { passwordLengthError: true };
        }
        return null;
    };
}
