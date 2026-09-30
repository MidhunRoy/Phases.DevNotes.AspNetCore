using System.Text;
using System.Text.RegularExpressions;
using Phases.DevNotes.AspNetCore.Models;

namespace Phases.DevNotes.AspNetCore.Services
{
    internal static class TodoCommentParser
    {
        private const string CodeGuideType = "code";

        private static readonly Regex MarkerRegex = new(
            @"^(TODO|FIXME|BUG|HACK|IDEA|FEATURE)\s*:?\s*(.*)$",
            RegexOptions.IgnoreCase | RegexOptions.Compiled | RegexOptions.CultureInvariant);

        private static readonly Regex DevNoteMarkerRegex = new(
            @"^DEVNOTE\s*:?\s*(.*)$",
            RegexOptions.IgnoreCase | RegexOptions.Compiled | RegexOptions.CultureInvariant);

        /// <summary>
        /// Structured learning fields for DEVNOTE explanations.
        /// "Why here" is matched before "Why".
        /// </summary>
        private static readonly Regex StructuredFieldRegex = new(
            @"^(What|Why\s+here|Why|Advantage|How|Example)\s*:\s*(.*)$",
            RegexOptions.IgnoreCase | RegexOptions.Compiled | RegexOptions.CultureInvariant);

        private static readonly Regex CSharpMethodRegex = new(
            @"^\s*(?:(?:public|private|protected|internal|static|virtual|override|sealed|async|partial|unsafe|extern|new)\s+)+(?:[\w<>\[\],\.\?\s]+?\s+)?(\w+)\s*\([^;{}]*\)\s*(?:\{|=>|$)",
            RegexOptions.Compiled | RegexOptions.CultureInvariant);

        public static IReadOnlyList<ScannedNote> ParseFile(
            string relativePath,
            string[] lines,
            bool detectMethodNames,
            int maxResults,
            ref int remainingCapacity)
        {
            if (remainingCapacity <= 0)
            {
                return Array.Empty<ScannedNote>();
            }

            var results = new List<ScannedNote>();
            var inBlockComment = false;
            var blockStartLineIndex = -1;
            var blockBuffer = new StringBuilder();

            for (var lineIndex = 0; lineIndex < lines.Length; lineIndex++)
            {
                if (remainingCapacity <= 0)
                {
                    break;
                }

                var line = lines[lineIndex];
                var lineNumber = lineIndex + 1;

                if (inBlockComment)
                {
                    blockBuffer.AppendLine(line);
                    if (line.Contains("*/", StringComparison.Ordinal))
                    {
                        inBlockComment = false;
                        TryAddFromBlock(
                            blockBuffer.ToString(),
                            relativePath,
                            blockStartLineIndex,
                            detectMethodNames,
                            lines,
                            results,
                            ref remainingCapacity);
                        blockBuffer.Clear();
                        blockStartLineIndex = -1;
                    }

                    continue;
                }

                var blockStart = line.IndexOf("/*", StringComparison.Ordinal);
                if (blockStart >= 0)
                {
                    var blockEnd = line.IndexOf("*/", blockStart + 2, StringComparison.Ordinal);
                    if (blockEnd >= 0)
                    {
                        var inlineBlock = line.Substring(blockStart, blockEnd - blockStart + 2);
                        TryAddFromBlock(
                            inlineBlock,
                            relativePath,
                            lineIndex,
                            detectMethodNames,
                            lines,
                            results,
                            ref remainingCapacity);
                        var afterBlock = line.Substring(blockEnd + 2);
                        if (!string.IsNullOrWhiteSpace(afterBlock))
                        {
                            var consumed = TryConsumeLineCommentAnnotation(
                                lines,
                                lineIndex,
                                afterBlock,
                                relativePath,
                                detectMethodNames,
                                results,
                                ref remainingCapacity);
                            if (consumed > 0)
                            {
                                lineIndex += consumed - 1;
                            }
                            else
                            {
                                TryAddFromLine(afterBlock, relativePath, lineNumber, detectMethodNames, lines, lineIndex, results, ref remainingCapacity);
                            }
                        }

                        continue;
                    }

                    inBlockComment = true;
                    blockStartLineIndex = lineIndex;
                    blockBuffer.Clear();
                    blockBuffer.AppendLine(line);
                    continue;
                }

                var lineCommentConsumed = TryConsumeLineCommentAnnotation(
                    lines,
                    lineIndex,
                    line,
                    relativePath,
                    detectMethodNames,
                    results,
                    ref remainingCapacity);
                if (lineCommentConsumed > 0)
                {
                    lineIndex += lineCommentConsumed - 1;
                    continue;
                }

                TryAddFromLine(line, relativePath, lineNumber, detectMethodNames, lines, lineIndex, results, ref remainingCapacity);
            }

            return results;
        }

        /// <summary>
        /// Parses a // DEVNOTE annotation with optional consecutive // explanation lines.
        /// Returns the number of source lines consumed, or 0 when the line is not a DEVNOTE marker.
        /// </summary>
        private static int TryConsumeLineCommentAnnotation(
            string[] lines,
            int startLineIndex,
            string line,
            string relativePath,
            bool detectMethodNames,
            List<ScannedNote> results,
            ref int remainingCapacity)
        {
            if (remainingCapacity <= 0)
            {
                return 0;
            }

            if (!TryGetLineCommentContent(line, out var content))
            {
                return 0;
            }

            var match = DevNoteMarkerRegex.Match(content);
            if (!match.Success)
            {
                return 0;
            }

            var title = match.Groups[1].Value.Trim();
            if (title.Length == 0)
            {
                title = "Untitled";
            }

            var descriptionLines = new List<string>();
            var consumed = 1;

            for (var i = startLineIndex + 1; i < lines.Length; i++)
            {
                if (!TryGetLineCommentContent(lines[i], out var nextContent))
                {
                    break;
                }

                var trimmedNext = nextContent.Trim();
                if (trimmedNext.Length == 0)
                {
                    break;
                }

                if (DevNoteMarkerRegex.IsMatch(trimmedNext) || MarkerRegex.IsMatch(trimmedNext))
                {
                    break;
                }

                descriptionLines.Add(trimmedNext);
                consumed++;
            }

            AddCodeGuideNote(
                results,
                title,
                JoinDescription(descriptionLines),
                relativePath,
                startLineIndex + 1,
                detectMethodNames ? FindNearestCSharpMethod(lines, startLineIndex) : string.Empty,
                ref remainingCapacity);

            return consumed;
        }

        private static void TryAddFromBlock(
            string blockContent,
            string relativePath,
            int blockStartLineIndex,
            bool detectMethodNames,
            string[] lines,
            List<ScannedNote> results,
            ref int remainingCapacity)
        {
            if (remainingCapacity <= 0 || blockStartLineIndex < 0)
            {
                return;
            }

            var normalizedBlock = blockContent
                .Replace("\r\n", "\n", StringComparison.Ordinal)
                .Replace('\r', '\n');

            var rawLines = normalizedBlock.Split('\n');
            var contentLines = new List<(string Text, int LineOffset)>();

            for (var offset = 0; offset < rawLines.Length; offset++)
            {
                var cleaned = CleanBlockLine(rawLines[offset]);
                if (cleaned is null)
                {
                    continue;
                }

                contentLines.Add((cleaned, offset));
            }

            for (var i = 0; i < contentLines.Count && remainingCapacity > 0; i++)
            {
                var (text, lineOffset) = contentLines[i];
                var markerLineNumber = blockStartLineIndex + lineOffset + 1;
                var methodLookupIndex = Math.Min(blockStartLineIndex + lineOffset, lines.Length - 1);

                var devNoteMatch = DevNoteMarkerRegex.Match(text);
                if (devNoteMatch.Success)
                {
                    var title = devNoteMatch.Groups[1].Value.Trim();
                    if (title.Length == 0)
                    {
                        title = "Untitled";
                    }

                    var descriptionLines = new List<string>();
                    var cursor = i + 1;
                    while (cursor < contentLines.Count)
                    {
                        var nextText = contentLines[cursor].Text;
                        if (DevNoteMarkerRegex.IsMatch(nextText) || MarkerRegex.IsMatch(nextText))
                        {
                            break;
                        }

                        descriptionLines.Add(nextText);
                        cursor++;
                    }

                    AddCodeGuideNote(
                        results,
                        title,
                        JoinDescription(descriptionLines),
                        relativePath,
                        markerLineNumber,
                        detectMethodNames ? FindNearestCSharpMethod(lines, Math.Max(0, methodLookupIndex)) : string.Empty,
                        ref remainingCapacity);

                    i = cursor - 1;
                    continue;
                }

                var markerMatch = MarkerRegex.Match(text);
                if (!markerMatch.Success)
                {
                    continue;
                }

                var markerTitle = markerMatch.Groups[2].Value.Trim();
                if (markerTitle.Length == 0)
                {
                    markerTitle = text;
                }

                var marker = markerMatch.Groups[1].Value.ToUpperInvariant();
                results.Add(new ScannedNote
                {
                    Title = markerTitle,
                    Description = string.Empty,
                    Type = MapMarkerToType(marker),
                    FilePath = relativePath,
                    LineNumber = markerLineNumber,
                    MethodName = detectMethodNames
                        ? FindNearestCSharpMethod(lines, Math.Max(0, methodLookupIndex))
                        : string.Empty,
                    Tags = new List<string> { marker.ToLowerInvariant() }
                });

                remainingCapacity--;
            }
        }

        private static string? CleanBlockLine(string? line)
        {
            if (line is null)
            {
                return null;
            }

            var cleaned = line
                .Replace("/*", string.Empty, StringComparison.Ordinal)
                .Replace("*/", string.Empty, StringComparison.Ordinal)
                .Trim();

            if (cleaned.StartsWith('*'))
            {
                cleaned = cleaned.TrimStart('*').TrimStart();
            }

            return string.IsNullOrWhiteSpace(cleaned) ? null : cleaned;
        }

        private static void TryAddFromLine(
            string line,
            string relativePath,
            int lineNumber,
            bool detectMethodNames,
            string[] lines,
            int lineIndex,
            List<ScannedNote> results,
            ref int remainingCapacity)
        {
            var trimmed = line.Trim();
            if (trimmed.Length == 0)
            {
                return;
            }

            string? content = null;

            if (trimmed.StartsWith("//", StringComparison.Ordinal))
            {
                // DEVNOTE line comments are handled by TryConsumeLineCommentAnnotation.
                content = trimmed[2..].TrimStart();
                if (DevNoteMarkerRegex.IsMatch(content))
                {
                    return;
                }
            }
            else if (trimmed.StartsWith('#'))
            {
                content = trimmed[1..].TrimStart();
            }
            else if (trimmed.StartsWith('*'))
            {
                content = trimmed.TrimStart('*').TrimStart();
            }
            else if (trimmed.Contains("<!--", StringComparison.Ordinal))
            {
                var start = trimmed.IndexOf("<!--", StringComparison.Ordinal);
                var end = trimmed.IndexOf("-->", start + 4, StringComparison.Ordinal);
                if (end > start)
                {
                    content = trimmed.Substring(start + 4, end - start - 4).Trim();
                }
            }
            else if (trimmed.StartsWith("<!--", StringComparison.Ordinal) && trimmed.EndsWith("-->", StringComparison.Ordinal))
            {
                content = trimmed[4..^3].Trim();
            }

            if (content is null)
            {
                return;
            }

            TryAddFromContent(content, relativePath, lineNumber, detectMethodNames, lines, lineIndex, results, ref remainingCapacity);
        }

        private static void TryAddFromContent(
            string content,
            string relativePath,
            int lineNumber,
            bool detectMethodNames,
            string[] lines,
            int lineIndex,
            List<ScannedNote> results,
            ref int remainingCapacity)
        {
            var normalized = content.Replace("*/", string.Empty, StringComparison.Ordinal)
                .Replace("<!--", string.Empty, StringComparison.Ordinal)
                .Replace("-->", string.Empty, StringComparison.Ordinal)
                .Replace("/*", string.Empty, StringComparison.Ordinal)
                .Trim();

            if (normalized.Length == 0)
            {
                return;
            }

            foreach (var segment in normalized.Split('\n', '\r'))
            {
                var segmentText = segment.Trim();
                if (segmentText.Length == 0)
                {
                    continue;
                }

                if (DevNoteMarkerRegex.IsMatch(segmentText))
                {
                    // Multi-line DEVNOTE in blocks is handled by TryAddFromBlock.
                    continue;
                }

                var match = MarkerRegex.Match(segmentText);
                if (!match.Success)
                {
                    continue;
                }

                var title = match.Groups[2].Value.Trim();
                if (title.Length == 0)
                {
                    title = segmentText;
                }

                var marker = match.Groups[1].Value.ToUpperInvariant();
                var noteType = MapMarkerToType(marker);
                var methodName = detectMethodNames
                    ? FindNearestCSharpMethod(lines, lineIndex)
                    : string.Empty;

                results.Add(new ScannedNote
                {
                    Title = title,
                    Description = string.Empty,
                    Type = noteType,
                    FilePath = relativePath,
                    LineNumber = lineNumber,
                    MethodName = methodName,
                    Tags = new List<string> { marker.ToLowerInvariant() }
                });

                remainingCapacity--;
                if (remainingCapacity <= 0)
                {
                    return;
                }
            }
        }

        private static void AddCodeGuideNote(
            List<ScannedNote> results,
            string title,
            string description,
            string relativePath,
            int lineNumber,
            string methodName,
            ref int remainingCapacity)
        {
            if (remainingCapacity <= 0)
            {
                return;
            }

            results.Add(new ScannedNote
            {
                Title = title,
                Description = description,
                Type = CodeGuideType,
                FilePath = relativePath,
                LineNumber = lineNumber,
                MethodName = methodName ?? string.Empty,
                Tags = new List<string> { "devnote", "code" }
            });

            remainingCapacity--;
        }

        private static string JoinDescription(IReadOnlyList<string> lines)
        {
            if (lines is null || lines.Count == 0)
            {
                return string.Empty;
            }

            var trimmed = lines
                .Where(line => !string.IsNullOrWhiteSpace(line))
                .Select(line => line.Trim())
                .ToList();

            if (trimmed.Count == 0)
            {
                return string.Empty;
            }

            // Prefer a normalized structured description when labeled fields are present.
            // Answer text is preserved exactly; only field labels are canonicalized.
            if (TryFormatStructuredDescription(trimmed, out var structured))
            {
                return structured;
            }

            return string.Join("\n", trimmed);
        }

        /// <summary>
        /// Builds a Description from labeled learning lines (What / Why / Why here / …).
        /// Returns false when no supported labels are present so callers keep freeform text.
        /// </summary>
        private static bool TryFormatStructuredDescription(IReadOnlyList<string> lines, out string formatted)
        {
            formatted = string.Empty;
            if (lines is null || lines.Count == 0)
            {
                return false;
            }

            var preamble = new List<string>();
            var sections = new List<(string Label, StringBuilder Value)>();
            var indexByLabel = new Dictionary<string, int>(StringComparer.Ordinal);
            string? currentLabel = null;

            foreach (var line in lines)
            {
                var match = StructuredFieldRegex.Match(line);
                if (match.Success)
                {
                    var label = CanonicalStructuredFieldLabel(match.Groups[1].Value);
                    var value = match.Groups[2].Value.TrimEnd();

                    if (indexByLabel.TryGetValue(label, out var existingIndex))
                    {
                        currentLabel = label;
                        if (!string.IsNullOrEmpty(value))
                        {
                            var existing = sections[existingIndex].Value;
                            if (existing.Length > 0)
                            {
                                existing.Append('\n');
                            }

                            existing.Append(value);
                        }

                        continue;
                    }

                    indexByLabel[label] = sections.Count;
                    sections.Add((label, new StringBuilder(value)));
                    currentLabel = label;
                    continue;
                }

                if (currentLabel is not null && indexByLabel.TryGetValue(currentLabel, out var sectionIndex))
                {
                    var builder = sections[sectionIndex].Value;
                    if (builder.Length > 0)
                    {
                        builder.Append('\n');
                    }

                    builder.Append(line);
                    continue;
                }

                preamble.Add(line);
            }

            if (sections.Count == 0)
            {
                return false;
            }

            var output = new StringBuilder();
            if (preamble.Count > 0)
            {
                output.Append(string.Join("\n", preamble));
                output.Append('\n');
            }

            for (var i = 0; i < sections.Count; i++)
            {
                var (label, valueBuilder) = sections[i];
                if (output.Length > 0 && output[^1] != '\n')
                {
                    output.Append('\n');
                }

                var answer = valueBuilder.ToString().TrimEnd();
                output.Append(label);
                output.Append(": ");
                output.Append(answer);
            }

            formatted = output.ToString().TrimEnd();
            return true;
        }

        private static string CanonicalStructuredFieldLabel(string rawLabel)
        {
            var key = Regex.Replace((rawLabel ?? string.Empty).Trim(), @"\s+", " ")
                .ToLowerInvariant();

            return key switch
            {
                "what" => "What",
                "why" => "Why",
                "why here" => "Why here",
                "advantage" => "Advantage",
                "how" => "How",
                "example" => "Example",
                _ => (rawLabel ?? string.Empty).Trim()
            };
        }

        private static bool TryGetLineCommentContent(string line, out string content)
        {
            content = string.Empty;
            var trimmed = (line ?? string.Empty).Trim();
            if (!trimmed.StartsWith("//", StringComparison.Ordinal))
            {
                return false;
            }

            content = trimmed[2..].TrimStart();
            return true;
        }

        private static string MapMarkerToType(string marker) =>
            marker switch
            {
                "FIXME" or "BUG" => "bug",
                "IDEA" or "FEATURE" => "idea",
                "TODO" or "HACK" => "task",
                _ => "task"
            };

        private static string FindNearestCSharpMethod(string[] lines, int fromLineIndex)
        {
            for (var i = fromLineIndex; i >= 0; i--)
            {
                var line = lines[i];
                if (string.IsNullOrWhiteSpace(line) || line.TrimStart().StartsWith("//", StringComparison.Ordinal))
                {
                    continue;
                }

                var match = CSharpMethodRegex.Match(line);
                if (match.Success)
                {
                    var name = match.Groups[1].Value;
                    if (!IsReservedKeyword(name))
                    {
                        return name;
                    }
                }
            }

            return string.Empty;
        }

        private static bool IsReservedKeyword(string name) =>
            name is "if" or "for" or "foreach" or "while" or "switch" or "catch" or "using" or "lock" or "return";
    }
}
