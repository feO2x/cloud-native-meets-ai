using FluentValidation;

namespace AiInformationExtractionApi.AiAccess;

public sealed class AiOptionsValidator : AbstractValidator<AiOptions>
{
    public AiOptionsValidator()
    {
        RuleFor(options => options.ApiKey).NotEmpty();
        RuleFor(options => options.AudioTranscriptionService).NotEmpty();
        RuleFor(options => options.TextVisionModel).NotEmpty();
        RuleFor(options => options.AudioTranscriptionModel).NotEmpty();
        RuleFor(options => options.AudioTranscriptionService).NotEmpty();
    }
}
