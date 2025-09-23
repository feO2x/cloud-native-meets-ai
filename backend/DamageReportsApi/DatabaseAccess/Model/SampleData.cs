using System;
using System.Collections.Generic;
using Shared.Messages.DamageReports;

namespace DamageReportsApi.DatabaseAccess.Model;

public static class SampleData
{
    public static List<DamageReport> CreateSampleDamageReports()
    {
        var reports = new List<DamageReport>();
        var baseDate = DateTime.UtcNow.AddDays(-30);

        // Sample Report 1: BreakDown - The Great Coffee Quest
        var report1 = new DamageReport
        {
            Id = Guid.Parse("0199748a-b2c4-7c00-96d8-85ec223134da"),
            CreatedAtUtc = baseDate.AddDays(1),

            // Personal Data
            FirstName = "Alice",
            LastName = "Coffeelover",
            Street = "123 Espresso Lane",
            ZipCode = "12345",
            Location = "Brewtown",
            InsuranceId = "INS-COFFEE-2024",
            DateOfBirth = new DateOnly(1990, 3, 15),
            Telephone = "+1-555-JAVA-123",
            Email = "alice.coffeelover@brewmail.com",
            LicensePlate = "CAFE-42",

            // Circumstances
            DateOfAccidentUtc = baseDate.AddDays(1).AddHours(7).AddMinutes(23),
            AccidentType = AccidentType.BreakDown,
            CountryCode = "US",
            ReasonOfTravel =
                "Emergency mission to find the legendary 24-hour drive-thru coffee shop that supposedly exists somewhere in the next county (my regular barista called in sick)",
            CarType = "Toyota Caffeine-a",
            CarColor = "Coffee Brown",
            Passengers =
            [
                new Passenger
                {
                    FirstName = "Bob",
                    LastName = "Decaf",
                    Id = Guid.Parse("0199748b-e077-727a-b360-57f820f320c4")
                }
            ],

            // Vehicle Damage (minor breakdown issues)
            Hood = DamageType.Dent, // Bonnet dented from frustrated coffee withdrawal head-bang
            FrontBumper = DamageType.Scratch, // Scratched while parking too close to coffee shop barrier
            LeftHeadlights = DamageType.Crack // Cracked from sleep-deprivation-induced fender bender in parking lot
        };

        // Sample Report 2: CarAccident - The Pizza Delivery Disaster
        var report2 = new DamageReport
        {
            Id = Guid.Parse("0199748e-2a4e-70a5-937f-dc04197d47b0"),
            CreatedAtUtc = baseDate.AddDays(10),

            // Personal Data
            FirstName = "Marco",
            LastName = "Pepperoni",
            Street = "456 Mozzarella Street",
            ZipCode = "54321",
            Location = "Little Italy",
            InsuranceId = "INS-PIZZA-2024",
            DateOfBirth = new DateOnly(1988, 7, 22),
            Telephone = "+1-555-PIZZA-PIE",
            Email = "marco.pepperoni@slicedelivery.com",
            LicensePlate = "PIZZA-1",

            // Circumstances
            DateOfAccidentUtc = baseDate.AddDays(10).AddHours(19).AddMinutes(47),
            AccidentType = AccidentType.CarAccident,
            CountryCode = "US",
            ReasonOfTravel =
                "Racing against time to deliver 15 extra-large pizzas to a developer meetup before they switch to competing pizza place (30-minute guarantee was at 29 minutes and 45 seconds)",
            CarType = "Honda Delivery-matic",
            CarColor = "Marinara Red",
            Passengers =
            [
                new Passenger
                {
                    FirstName = "Luigi",
                    LastName = "Mushroom",
                    Id = Guid.Parse("0199748e-95e0-7307-8540-44de8ed13b02")
                },
                new Passenger
                {
                    FirstName = "Giuseppe",
                    LastName = "Anchovies",
                    Id = Guid.Parse("0199748f-bdfa-76f8-9dda-7f5ca3aa125a")
                }
            ],
            OtherPartyContact = new OtherPartyContact
            {
                FirstName = "Karen",
                LastName = "Slowdriver",
                Id = Guid.Parse("01997490-454a-7d9a-9446-ca381fa1f2ed")
            },

            // Vehicle Damage (moderate accident damage)
            FrontBumper = DamageType.Dent,
            RearBumper = DamageType.Scratch,
            FrontRightFender = DamageType.Dent,
            RightHeadlights = DamageType.Crack,
            Windshield = DamageType.Chip,
            FrontRightDoor = DamageType.Dent,
            RightSideMirror = DamageType.Dislodgement, // Mirror fell off during impact
            FrontRightWheel = DamageType.Misalignment // Wheel alignment messed up
        };

        // Sample Report 3: VehicleTheft - The Convention Center Chaos
        var report3 = new DamageReport
        {
            Id = Guid.Parse("01997497-48e4-780f-bdef-f72d01672f14"),
            CreatedAtUtc = baseDate.AddDays(20),

            // Personal Data
            FirstName = "Diana",
            LastName = "Keynote",
            Street = "789 Conference Blvd",
            ZipCode = "98765",
            Location = "Tech Valley",
            InsuranceId = "INS-SPEAK-2024",
            DateOfBirth = new DateOnly(1985, 11, 8),
            Telephone = "+1-555-PRESENT-IT",
            Email = "diana.keynote@techtalks.com",
            LicensePlate = "SPK-EASY",

            // Circumstances
            DateOfAccidentUtc = baseDate.AddDays(20).AddHours(14).AddMinutes(15),
            AccidentType = AccidentType.VehicleTheft,
            CountryCode = "US",
            ReasonOfTravel =
                "Frantically driving between three different tech conferences to deliver keynote speeches about 'The Future of AI in Transportation' (ironic, considering what happened to my own transportation)",
            CarType = "Tesla Model S",
            CarColor = "Conference Center Silver",
            Passengers = [],

            // Vehicle Damage (theft recovery damage - more extensive)
            FrontBumper = DamageType.Scratch,
            RearBumper = DamageType.Dent,
            Hood = DamageType.Scratch,
            TrunkLid = DamageType.Dent, // Forced open by thieves
            FrontLeftDoor = DamageType.Dent,
            FrontRightDoor = DamageType.Scratch,
            LeftSideMirror = DamageType.Dislodgement, // Broken off during theft
            RightSideMirror = DamageType.Crack,
            Windshield = DamageType.Crack, // Cracked windshield from attempted break-in
            FrontLeftWindow = DamageType.Hole, // Window smashed by thieves
            LeftHeadlights = DamageType.Crack,
            LeftTaillights = DamageType.Crack,
            FrontLeftWheel = DamageType.Scratch, // Scraped against curb during joyride
            RearLeftWheel = DamageType.Scratch,
            LeftExteriorTrim = DamageType.Tear, // Trim damaged during recovery
            Grille = DamageType.Dent // Front grille damaged
        };

        // Link passengers and other party contacts to their respective reports
        foreach (var passenger in report1.Passengers)
        {
            passenger.DamageReportId = report1.Id;
            passenger.DamageReport = report1;
        }

        foreach (var passenger in report2.Passengers)
        {
            passenger.DamageReportId = report2.Id;
            passenger.DamageReport = report2;
        }

        if (report2.OtherPartyContact != null)
        {
            report2.OtherPartyContact.DamageReportId = report2.Id;
            report2.OtherPartyContact.DamageReport = report2;
        }

        reports.Add(report1);
        reports.Add(report2);
        reports.Add(report3);

        return reports;
    }
}
