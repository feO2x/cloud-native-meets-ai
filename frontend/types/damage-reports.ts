// TypeScript DTOs matching the C# backend DTOs
// Note: Properties are in lowerCamelCase as per web API serialization

export enum AccidentType {
  BreakDown = 'BreakDown',
  CarAccident = 'CarAccident',
  VehicleTheft = 'VehicleTheft',
  SomethingElse = 'SomethingElse'
}

export enum DamageType {
  None = 'None',
  Scratch = 'Scratch',
  Crack = 'Crack',
  Dent = 'Dent',
  Chip = 'Chip',
  Hole = 'Hole',
  Tear = 'Tear',
  Dislodgement = 'Dislodgement',
  Misalignment = 'Misalignment'
}

export interface PersonDto {
  firstName: string;
  lastName: string;
}

export interface DamageReportListDto {
  id: string;
  firstName: string;
  lastName: string;
  dateOfAccidentUtc: string;
  accidentType: AccidentType;
}

export interface PersonalDataDto {
  firstName: string;
  lastName: string;
  street: string;
  zipCode: string;
  location: string;
  insuranceId: string;
  dateOfBirth: string; // DateOnly in C# becomes string in JSON
  telephone: string;
  email: string;
  licensePlate: string;
}

export interface CircumstancesDto {
  dateOfAccidentUtc: string;
  accidentType: AccidentType;
  passengers: PersonDto[];
  countryCode: string;
  reasonOfTravel: string;
  otherPartyContact: PersonDto | null;
  carType: string;
  carColor: string;
}

export interface VehicleDamageDto {
  frontBumper: DamageType;
  rearBumper: DamageType;
  hood: DamageType;
  trunkLid: DamageType;
  roof: DamageType;
  frontLeftDoor: DamageType;
  frontRightDoor: DamageType;
  rearLeftDoor: DamageType;
  rearRightDoor: DamageType;
  frontLeftFender: DamageType;
  frontRightFender: DamageType;
  rearLeftFender: DamageType;
  rearRightFender: DamageType;
  grille: DamageType;
  leftHeadlights: DamageType;
  rightHeadlights: DamageType;
  leftTaillights: DamageType;
  rightTaillights: DamageType;
  leftSideMirror: DamageType;
  rightSideMirror: DamageType;
  windshield: DamageType;
  rearWindshield: DamageType;
  frontLeftWindow: DamageType;
  frontRightWindow: DamageType;
  rearLeftWindow: DamageType;
  rearRightWindow: DamageType;
  frontLeftWheel: DamageType;
  frontRightWheel: DamageType;
  rearLeftWheel: DamageType;
  rearRightWheel: DamageType;
  leftExteriorTrim: DamageType;
  rightExteriorTrim: DamageType;
}

export interface DamageReportDto {
  id: string;
  createdAtUtc: string;
  personalData: PersonalDataDto;
  circumstances: CircumstancesDto;
  vehicleDamage: VehicleDamageDto;
}

// Paging support
export interface PagingParameters {
  skip: number;
  take: number;
}

// AI Analysis API types
export enum FormSection {
  All = 'All',
  PersonalData = 'PersonalData',
  Circumstances = 'Circumstances',
  VehicleDamage = 'VehicleDamage'
}

export interface AnalyzeTextRequestDto {
  formSection: FormSection;
  textToAnalyze: string;
  existingDamageReportData: Record<string, unknown>; // JsonElement equivalent
}

export interface AnalysisResponseDto {
  analysisType: string;
  formSection: FormSection;
  createdAtUtc: string;
  analysisResult: PersonalDataDto; // For PersonalData section
}
