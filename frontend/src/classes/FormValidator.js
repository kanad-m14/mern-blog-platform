class FormValidator {
  constructor() {
    this.errors = {};
  }

  validate(field, value, rules) {
    const errors = [];

    if (rules.required && !value.trim()) {
      errors.push(`${field} is required`);
    }

    if (rules.minLength && value.length < rules.minLength) {
      errors.push(`${field} must be at least ${rules.minLength} characters`);
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      errors.push(`${field} must be less than ${rules.maxLength} characters`);
    }

    if (rules.email && !this.isValidEmail(value)) {
      errors.push(`${field} must be a valid email`);
    }

    if (rules.match && value !== rules.match) {
      errors.push(`${field} does not match`);
    }

    return errors;
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  validateForm(fields) {
    this.errors = {};
    let isValid = true;

    Object.keys(fields).forEach(fieldName => {
      const { value, rules } = fields[fieldName];
      const fieldErrors = this.validate(fieldName, value, rules);
      
      if (fieldErrors.length > 0) {
        this.errors[fieldName] = fieldErrors;
        isValid = false;
      }
    });

    return { isValid, errors: this.errors };
  }

  getErrors() {
    return this.errors;
  }

  clearErrors() {
    this.errors = {};
  }
}

export default FormValidator;