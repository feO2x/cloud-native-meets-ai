'use client';

import React from 'react';
import { Form, Input, DatePicker, Select, Button, Row, Col, Typography, Card, Space } from 'antd';
import { ExclamationCircleOutlined, UserAddOutlined, PlusOutlined, DeleteOutlined, ContactsOutlined } from '@ant-design/icons';
import { CircumstancesDto, AccidentType, PersonDto } from '../../types/damage-reports';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

interface CircumstancesFormProps {
  data: CircumstancesDto;
  onDataChange: (data: CircumstancesDto) => void;
}

const accidentTypeOptions = [
  { value: AccidentType.CarAccident, label: 'Car Accident' },
  { value: AccidentType.BreakDown, label: 'Break Down' },
  { value: AccidentType.VehicleTheft, label: 'Vehicle Theft' },
  { value: AccidentType.SomethingElse, label: 'Something Else' }
];

const countryOptions = [
  { value: 'US', label: 'United States' },
  { value: 'CA', label: 'Canada' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'DE', label: 'Germany' },
  { value: 'FR', label: 'France' },
  { value: 'IT', label: 'Italy' },
  { value: 'ES', label: 'Spain' },
  { value: 'NL', label: 'Netherlands' },
  { value: 'BE', label: 'Belgium' },
  { value: 'AT', label: 'Austria' },
  { value: 'CH', label: 'Switzerland' }
];

export const CircumstancesForm: React.FC<CircumstancesFormProps> = ({ data, onDataChange }) => {
  const handleFieldChange = (field: keyof CircumstancesDto, value: string | AccidentType | PersonDto[] | PersonDto | null) => {
    onDataChange({
      ...data,
      [field]: value
    });
  };

  const handleDateChange = (date: dayjs.Dayjs | null) => {
    if (date) {
      handleFieldChange('dateOfAccidentUtc', date.toISOString());
    }
  };

  const addPassenger = () => {
    const newPassenger: PersonDto = { firstName: '', lastName: '' };
    handleFieldChange('passengers', [...data.passengers, newPassenger]);
  };

  const removePassenger = (index: number) => {
    const updatedPassengers = data.passengers.filter((_, i) => i !== index);
    handleFieldChange('passengers', updatedPassengers);
  };

  const updatePassenger = (index: number, field: keyof PersonDto, value: string) => {
    const updatedPassengers = data.passengers.map((passenger, i) => 
      i === index ? { ...passenger, [field]: value } : passenger
    );
    handleFieldChange('passengers', updatedPassengers);
  };

  const handleOtherPartyContactChange = (field: keyof PersonDto, value: string) => {
    if (!data.otherPartyContact) {
      handleFieldChange('otherPartyContact', { firstName: '', lastName: '', [field]: value });
    } else {
      handleFieldChange('otherPartyContact', { ...data.otherPartyContact, [field]: value });
    }
  };

  const toggleOtherPartyContact = (hasContact: boolean) => {
    if (hasContact) {
      handleFieldChange('otherPartyContact', { firstName: '', lastName: '' });
    } else {
      handleFieldChange('otherPartyContact', null);
    }
  };

  return (
    <div>
      <Title level={3} style={{ marginBottom: '24px' }}>
        <ExclamationCircleOutlined style={{ marginRight: '8px' }} />
        Accident Circumstances
      </Title>
      
      <Form layout="vertical" size="large">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Date and Time of Accident" required>
              <DatePicker
                showTime
                style={{ width: '100%' }}
                placeholder="Select accident date and time"
                value={dayjs(data.dateOfAccidentUtc)}
                onChange={handleDateChange}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Type of Accident" required>
              <Select
                placeholder="Select accident type"
                value={data.accidentType}
                onChange={(value) => handleFieldChange('accidentType', value)}
              >
                {accidentTypeOptions.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Country" required>
              <Select
                placeholder="Select country"
                value={data.countryCode}
                onChange={(value) => handleFieldChange('countryCode', value)}
                showSearch
                optionFilterProp="children"
              >
                {countryOptions.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item 
              label="Reason of Travel" 
              required
              validateStatus={!data.reasonOfTravel ? 'error' : ''}
              help={!data.reasonOfTravel ? 'Reason of travel is required' : ''}
            >
              <Input
                placeholder="e.g., Work, Vacation, Personal"
                value={data.reasonOfTravel}
                onChange={(e) => handleFieldChange('reasonOfTravel', e.target.value)}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item 
              label="Car Type/Model" 
              required
              validateStatus={!data.carType ? 'error' : ''}
              help={!data.carType ? 'Car type is required' : ''}
            >
              <Input
                placeholder="e.g., Toyota Camry, BMW X5"
                value={data.carType}
                onChange={(e) => handleFieldChange('carType', e.target.value)}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item 
              label="Car Color" 
              required
              validateStatus={!data.carColor ? 'error' : ''}
              help={!data.carColor ? 'Car color is required' : ''}
            >
              <Input
                placeholder="e.g., White, Black, Silver"
                value={data.carColor}
                onChange={(e) => handleFieldChange('carColor', e.target.value)}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Passengers Section */}
        <Card size="small" style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <Title level={5} style={{ margin: 0 }}>
              <UserAddOutlined style={{ marginRight: '8px' }} />
              Passengers
            </Title>
            <Button 
              type="dashed" 
              icon={<PlusOutlined />} 
              onClick={addPassenger}
            >
              Add Passenger
            </Button>
          </div>
          
          {data.passengers.length === 0 ? (
            <Text type="secondary">No passengers added</Text>
          ) : (
            <Space direction="vertical" style={{ width: '100%' }}>
              {data.passengers.map((passenger, index) => (
                <Card key={index} size="small" style={{ backgroundColor: '#fafafa' }}>
                  <Row gutter={8} align="middle">
                    <Col span={10}>
                      <Input
                        placeholder="First Name"
                        value={passenger.firstName}
                        onChange={(e) => updatePassenger(index, 'firstName', e.target.value)}
                      />
                    </Col>
                    <Col span={10}>
                      <Input
                        placeholder="Last Name"
                        value={passenger.lastName}
                        onChange={(e) => updatePassenger(index, 'lastName', e.target.value)}
                      />
                    </Col>
                    <Col span={4}>
                      <Button 
                        danger 
                        icon={<DeleteOutlined />} 
                        onClick={() => removePassenger(index)}
                      />
                    </Col>
                  </Row>
                </Card>
              ))}
            </Space>
          )}
        </Card>

        {/* Other Party Contact Section */}
        <Card size="small">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <Title level={5} style={{ margin: 0 }}>
              <ContactsOutlined style={{ marginRight: '8px' }} />
              Other Party Contact
            </Title>
            <Button 
              type={data.otherPartyContact ? "default" : "dashed"}
              onClick={() => toggleOtherPartyContact(!data.otherPartyContact)}
            >
              {data.otherPartyContact ? 'Remove Contact' : 'Add Other Party Contact'}
            </Button>
          </div>
          
          {data.otherPartyContact ? (
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="First Name">
                  <Input
                    placeholder="Other party first name"
                    value={data.otherPartyContact.firstName}
                    onChange={(e) => handleOtherPartyContactChange('firstName', e.target.value)}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Last Name">
                  <Input
                    placeholder="Other party last name"
                    value={data.otherPartyContact.lastName}
                    onChange={(e) => handleOtherPartyContactChange('lastName', e.target.value)}
                  />
                </Form.Item>
              </Col>
            </Row>
          ) : (
            <Text type="secondary">No other party contact information</Text>
          )}
        </Card>
      </Form>
    </div>
  );
};
