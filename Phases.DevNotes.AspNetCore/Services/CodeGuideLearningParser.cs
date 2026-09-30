using System.Text.RegularExpressions;

namespace Phases.DevNotes.AspNetCore.Services
{
    /// <summary>
    /// Parses structured DEVNOTE Description fields into learning sections.
    /// Does not invent missing fields or rewrite answer text.
    /// </summary>
    internal static class CodeGuideLearningParser
    {
        private static readonly Regex StructuredFieldRegex = new(
            @"^(What|Why\s+here|Why|Advantage|How|Example)\s*:\s*(.*)$",
            RegexOptions.IgnoreCase | RegexOptions.Compiled | RegexOptions.CultureInvariant);

        private static readonly (string Key, string LabelPattern, string QuestionTemplate, int Order)[] Fields =
        {
            ("what", @"^what$", "What does {title} do?", 1),
            ("why", @"^why$", "Why is it used?", 2),
            ("whyHere", @"^why\s+here$", "Why is it here?", 3),
            ("advantage", @"^advantage$", "What is the advantage?", 4),
            ("how", @"^how$", "How does it work?", 5),
            ("example", @"^example$", "Example", 6)
        };

        public static IReadOnlyList<CodeGuideLearningSection> Parse(string? description, string? annotationTitle)
        {
            var normalized = (description ?? string.Empty).Replace("\r\n", "\n").Replace('\r', '\n').Trim();
            if (normalized.Length == 0)
            {
                return Array.Empty<CodeGuideLearningSection>();
            }

            var title = string.IsNullOrWhiteSpace(annotationTitle) ? "this" : annotationTitle.Trim();
            var lines = normalized.Split('\n');
            var sectionMap = new Dictionary<string, CodeGuideLearningSection>(StringComparer.Ordinal);
            string? currentKey = null;
            var sawStructured = false;

            foreach (var rawLine in lines)
            {
                var line = rawLine.TrimEnd();
                var trimmed = line.Trim();
                if (trimmed.Length == 0)
                {
                    continue;
                }

                var match = StructuredFieldRegex.Match(trimmed);
                if (match.Success)
                {
                    var field = MatchField(match.Groups[1].Value);
                    if (field is not null)
                    {
                        sawStructured = true;
                        currentKey = field.Value.Key;
                        var value = match.Groups[2].Value.TrimEnd();
                        if (sectionMap.TryGetValue(currentKey, out var existing))
                        {
                            if (value.Length > 0)
                            {
                                existing.Answer = string.IsNullOrEmpty(existing.Answer)
                                    ? value
                                    : existing.Answer + "\n" + value;
                            }
                        }
                        else
                        {
                            sectionMap[currentKey] = new CodeGuideLearningSection
                            {
                                Key = currentKey,
                                Question = FormatQuestion(field.Value.QuestionTemplate, title),
                                Answer = value,
                                DisplayOrder = field.Value.Order
                            };
                        }

                        continue;
                    }
                }

                if (currentKey is not null && sectionMap.TryGetValue(currentKey, out var current))
                {
                    current.Answer = string.IsNullOrEmpty(current.Answer)
                        ? trimmed
                        : current.Answer + "\n" + trimmed;
                }
            }

            if (sawStructured)
            {
                return sectionMap.Values
                    .Where(section => !string.IsNullOrWhiteSpace(section.Answer))
                    .OrderBy(section => section.DisplayOrder)
                    .Select(section => new CodeGuideLearningSection
                    {
                        Key = section.Key,
                        Question = section.Question,
                        Answer = section.Answer.Trim(),
                        DisplayOrder = section.DisplayOrder
                    })
                    .ToList();
            }

            // Legacy unlabeled freeform: first line/paragraph = What, remainder = Why.
            var paragraphs = normalized.Split(new[] { "\n\n" }, StringSplitOptions.RemoveEmptyEntries)
                .Select(part => part.Trim())
                .Where(part => part.Length > 0)
                .ToList();

            string what;
            string why;
            if (paragraphs.Count >= 2)
            {
                what = paragraphs[0];
                why = string.Join("\n\n", paragraphs.Skip(1));
            }
            else
            {
                var plainLines = normalized.Split('\n')
                    .Select(line => line.Trim())
                    .Where(line => line.Length > 0)
                    .ToList();
                if (plainLines.Count >= 2)
                {
                    what = plainLines[0];
                    why = string.Join("\n", plainLines.Skip(1));
                }
                else
                {
                    what = normalized;
                    why = string.Empty;
                }
            }

            var legacy = new List<CodeGuideLearningSection>();
            if (!string.IsNullOrWhiteSpace(what))
            {
                legacy.Add(new CodeGuideLearningSection
                {
                    Key = "what",
                    Question = FormatQuestion("What does {title} do?", title),
                    Answer = what.Trim(),
                    DisplayOrder = 1
                });
            }

            if (!string.IsNullOrWhiteSpace(why))
            {
                legacy.Add(new CodeGuideLearningSection
                {
                    Key = "why",
                    Question = "Why is it used?",
                    Answer = why.Trim(),
                    DisplayOrder = 2
                });
            }

            return legacy;
        }

        private static (string Key, string QuestionTemplate, int Order)? MatchField(string rawLabel)
        {
            var normalized = Regex.Replace((rawLabel ?? string.Empty).Trim(), @"\s+", " ");
            // Prefer Why here before Why.
            foreach (var field in Fields.OrderByDescending(f => f.LabelPattern.Length))
            {
                if (Regex.IsMatch(normalized, field.LabelPattern, RegexOptions.IgnoreCase | RegexOptions.CultureInvariant))
                {
                    return (field.Key, field.QuestionTemplate, field.Order);
                }
            }

            return null;
        }

        private static string FormatQuestion(string template, string title) =>
            template.Replace("{title}", title, StringComparison.Ordinal);
    }
}
