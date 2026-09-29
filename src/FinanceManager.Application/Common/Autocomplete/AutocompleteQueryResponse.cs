using System.ComponentModel.DataAnnotations;

namespace FinanceManager.Application.Common.Autocomplete;

public sealed record AutocompleteQueryResponse([Required] int Id, [Required] string Value);
