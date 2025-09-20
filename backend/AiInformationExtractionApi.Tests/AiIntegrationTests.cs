using System;
using System.Diagnostics.CodeAnalysis;
using System.Text.Json;
using System.Threading.Tasks;
using AiInformationExtractionApi.AiAccess;
using AiInformationExtractionApi.Analyze.Prompting;
using FluentAssertions;
using Light.Xunit;
using Microsoft.Extensions.AI;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using OpenAI.Chat;
using Serilog;
using Shared.JsonAccess;
using Shared.Messages.Analyze;
using Shared.Messages.DamageReports;
using Xunit;
using Xunit.Abstractions;
using Xunit.Sdk;

namespace AiInformationExtractionApi.Tests;

[Experimental("MEAI001")]
public sealed class AiIntegrationTests : IAsyncLifetime
{
    private readonly ITestOutputHelper _output;
    private readonly AsyncServiceScope _scope;
    private readonly ServiceProvider _serviceProvider;

    public AiIntegrationTests(ITestOutputHelper output)
    {
        _output = output;
        var serilogLogger = output.CreateTestLogger();
        var services = new ServiceCollection()
           .AddLogging(logging => logging.AddSerilog(serilogLogger))
           .AddSingleton(TestSettings.Configuration)
           .AddSingleton(sp => AiOptions.FromConfiguration(sp.GetRequiredService<IConfiguration>()))
           .AddSingleton<IAiChatClient, MeaChatClient>()
           .AddPromptingModule();
        services.AddChatClient(
            sp =>
            {
                var options = sp.GetRequiredService<AiOptions>();
                return new ChatClient(options.TextVisionModel, options.ApiKey).AsIChatClient();
            }
        );
        _serviceProvider = services.BuildServiceProvider();
        _scope = _serviceProvider.CreateAsyncScope();
    }

    public Task InitializeAsync() => Task.CompletedTask;

    public async Task DisposeAsync()
    {
        await _scope.DisposeAsync();
        await _serviceProvider.DisposeAsync();
    }

    [SkippableFact]
    public async Task ExtractPersonalDataFromText()
    {
        SkipTestIfNecessary();

        const string textToAnalyze =
            """
            Greetings, my name is Anna Smith, I reside at 102 Oak Avenue, 75001 Uptown, my insurance ID is AB-1234567,
            I was born on 11/15/1985, my phone number is +44 2071234567, my email is anna.smith@example.com,
            and my license plate is XYZ-9876.
            """;
        var promptManager = _scope.ServiceProvider.GetRequiredService<PromptManager>();
        var messages = promptManager.CreateTextAnalysisPrompt(FormSection.PersonalData, textToAnalyze);
        var client = _scope.ServiceProvider.GetRequiredService<IAiChatClient>();

        var response = await client.CompleteChatAsync(messages);

        var responseText = response.Text;
        _output.WriteLine(responseText);
        var jsonDocument = Json.ParseDocument(responseText);
        var personalDataDto = jsonDocument.Deserialize<PersonalDataDto>(Json.Options);
        var expectedPersonalData = new PersonalDataDto
        {
            FirstName = "Anna",
            LastName = "Smith",
            Street = "102 Oak Avenue",
            ZipCode = "75001",
            Location = "Uptown",
            LicensePlate = "XYZ-9876",
            DateOfBirth = new DateOnly(1985, 11, 15),
            Telephone = "+44 2071234567",
            Email = "anna.smith@example.com",
            InsuranceId = "AB-1234567"
        };
        personalDataDto.Should().Be(expectedPersonalData);
    }

    [SkippableFact]
    public async Task ExtractCircumstancesFromText()
    {
        SkipTestIfNecessary();

        const string textToAnalyze =
            """
            The accident happened on 2023-07-20 at 4 in the afternoon. When I walked out of the city hall, I saw that
            my car, a dark green Toyota Yaris was damaged. I was alone that day. I don't know which car caused the
            accident, nor the driver's name.
            """;
        var existingInformation = Json.Serialize(
            new PersonalDataDto
            {
                FirstName = "Anna",
                LastName = "Smith",
                Street = "102 Oak Avenue",
                ZipCode = "75001",
                Location = "Uptown",
                LicensePlate = "XYZ-9876",
                DateOfBirth = new DateOnly(1985, 11, 15),
                Telephone = "+44 2071234567",
                Email = "anna.smith@example.com",
                InsuranceId = "AB-1234567"
            }
        );
        var promptManager = _scope.ServiceProvider.GetRequiredService<PromptManager>();
        var chatMessages = promptManager.CreateTextAnalysisPrompt(
            FormSection.Circumstances,
            textToAnalyze,
            existingInformation
        );
        var client = _scope.ServiceProvider.GetRequiredService<IAiChatClient>();

        var response = await client.CompleteChatAsync(chatMessages);

        var responseText = response.Text;
        _output.WriteLine(responseText);
        var circumstancesDto = Json.Deserialize<CircumstancesDto>(responseText);
        var expectedCircumstances = new CircumstancesDto
        {
            DateOfAccidentUtc = new DateTime(2023, 7, 20, 16, 0, 0, DateTimeKind.Utc),
            AccidentType = AccidentType.CarAccident,
            CarType = "Toyota Yaris",
            CarColor = "Dark Green",
            Passengers = []
        };
        circumstancesDto.Should().BeEquivalentTo(
            expectedCircumstances,
            options => options.Excluding(x => x.ReasonOfTravel)
               .Using<string>(x =>
                    {
                        if (!string.Equals(x.Subject, x.Expectation, StringComparison.OrdinalIgnoreCase))
                        {
                            throw new XunitException($"{x.Subject} is not equal to {x.Expectation}");
                        }
                    }
                )
               .WhenTypeIs<string>()
        );
    }

    private static void SkipTestIfNecessary() =>
        Skip.IfNot(TestSettings.Configuration.GetValue<bool>("ai:areTestsEnabled"));
}
