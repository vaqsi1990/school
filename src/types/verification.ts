export interface VerificationRequest {
  email: string;
}

export interface VerificationResponse {
  message: string;
  email: string;
}

export interface CodeVerificationRequest {
  email: string;
  code: string;
}

export interface CodeVerificationResponse {
  message: string;
  email: string;
}

export interface EmailVerificationStep {
  email: string;
}

export interface CodeVerificationStep {
  email: string;
  code: string;
}

export type VerificationStep = 'email' | 'code' | 'registration';
