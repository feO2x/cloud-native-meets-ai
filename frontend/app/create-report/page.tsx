'use client';

import React, { useState } from 'react';
import { Layout, Steps, Card, Button, message } from 'antd';
import { CarOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { PersonalDataDto, CircumstancesDto, VehicleDamageDto, DamageReportDto, DamageType, AccidentType } from '../../types/damage-reports';
import { PersonalDataForm } from '../../components/wizard/PersonalDataForm';
import { CircumstancesForm } from '../../components/wizard/CircumstancesForm';
import { VehicleDamageForm } from '../../components/wizard/VehicleDamageForm';
import { ReportSummary } from '../../components/wizard/ReportSummary';

const { Header, Content } = Layout;

export default function CreateReportPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Form data state
  const [personalData, setPersonalData] = useState<PersonalDataDto>({
    firstName: '',
    lastName: '',
    street: '',
    zipCode: '',
    location: '',
    insuranceId: '',
    dateOfBirth: '',
    telephone: '',
    email: '',
    licensePlate: ''
  });

  const [circumstances, setCircumstances] = useState<CircumstancesDto>({
    dateOfAccidentUtc: new Date().toISOString(),
    accidentType: AccidentType.CarAccident,
    passengers: [],
    countryCode: 'US',
    reasonOfTravel: '',
    otherPartyContact: null,
    carType: '',
    carColor: ''
  });

  const [vehicleDamage, setVehicleDamage] = useState<VehicleDamageDto>({
    frontBumper: DamageType.None,
    rearBumper: DamageType.None,
    hood: DamageType.None,
    trunkLid: DamageType.None,
    roof: DamageType.None,
    frontLeftDoor: DamageType.None,
    frontRightDoor: DamageType.None,
    rearLeftDoor: DamageType.None,
    rearRightDoor: DamageType.None,
    frontLeftFender: DamageType.None,
    frontRightFender: DamageType.None,
    rearLeftFender: DamageType.None,
    rearRightFender: DamageType.None,
    grille: DamageType.None,
    leftHeadlights: DamageType.None,
    rightHeadlights: DamageType.None,
    leftTaillights: DamageType.None,
    rightTaillights: DamageType.None,
    leftSideMirror: DamageType.None,
    rightSideMirror: DamageType.None,
    windshield: DamageType.None,
    rearWindshield: DamageType.None,
    frontLeftWindow: DamageType.None,
    frontRightWindow: DamageType.None,
    rearLeftWindow: DamageType.None,
    rearRightWindow: DamageType.None,
    frontLeftWheel: DamageType.None,
    frontRightWheel: DamageType.None,
    rearLeftWheel: DamageType.None,
    rearRightWheel: DamageType.None,
    leftExteriorTrim: DamageType.None,
    rightExteriorTrim: DamageType.None
  });

  const steps = [
    {
      title: 'Personal Data',
      content: (
        <PersonalDataForm 
          data={personalData} 
          onDataChange={setPersonalData}
        />
      )
    },
    {
      title: 'Circumstances',
      content: (
        <CircumstancesForm 
          data={circumstances} 
          onDataChange={setCircumstances}
        />
      )
    },
    {
      title: 'Vehicle Damage',
      content: (
        <VehicleDamageForm 
          data={vehicleDamage} 
          onDataChange={setVehicleDamage}
        />
      )
    },
    {
      title: 'Summary',
      content: (
        <ReportSummary 
          personalData={personalData}
          circumstances={circumstances}
          vehicleDamage={vehicleDamage}
        />
      )
    }
  ];

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 0: // Personal Data
        return !!(personalData.firstName && personalData.lastName && personalData.email && 
                 personalData.telephone && personalData.licensePlate && personalData.insuranceId);
      case 1: // Circumstances
        return !!(circumstances.carType && circumstances.carColor && circumstances.reasonOfTravel);
      case 2: // Vehicle Damage
        return true; // Vehicle damage is optional
      case 3: // Summary
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (!validateCurrentStep()) {
      message.error('Please fill in all required fields');
      return;
    }
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) {
      message.error('Please review all the information');
      return;
    }

    setLoading(true);
    try {
      const damageReport: DamageReportDto = {
        id: crypto.randomUUID(),
        createdAtUtc: new Date().toISOString(),
        personalData,
        circumstances,
        vehicleDamage
      };

      const response = await fetch('/api/damage-reports', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(damageReport)
      });

      if (!response.ok) {
        throw new Error(`Failed to submit report: ${response.status} ${response.statusText}`);
      }

      message.success('Damage report submitted successfully!');
      router.push('/');
      
    } catch (error) {
      console.error('Error submitting report:', error);
      message.error('Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToList = () => {
    router.push('/');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        display: 'flex', 
        alignItems: 'center',
        background: '#001529',
        justifyContent: 'space-between'
      }}>
        <div style={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}>
          <CarOutlined style={{ marginRight: '8px' }} />
          Create Damage Report
        </div>
        <Button 
          type="text" 
          icon={<ArrowLeftOutlined />} 
          onClick={handleBackToList}
          style={{ color: 'white' }}
        >
          Back to Reports
        </Button>
      </Header>
      
      <Content style={{ padding: '24px', background: '#f0f2f5' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <Card>
            <Steps
              current={currentStep}
              items={steps.map(step => ({ title: step.title }))}
              style={{ marginBottom: '32px' }}
            />
            
            <div style={{ minHeight: '400px', marginBottom: '24px' }}>
              {steps[currentStep].content}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button 
                onClick={handlePrev} 
                disabled={currentStep === 0}
              >
                Previous
              </Button>
              
              {currentStep < steps.length - 1 && (
                <Button type="primary" onClick={handleNext}>
                  Next
                </Button>
              )}
              
              {currentStep === steps.length - 1 && (
                <Button 
                  type="primary" 
                  onClick={handleSubmit}
                  loading={loading}
                >
                  Submit Report
                </Button>
              )}
            </div>
          </Card>
        </div>
      </Content>
    </Layout>
  );
}
