using System.Text;
using System.Text.RegularExpressions;
using Phases.DevNotes.AspNetCore.Models;

namespace Phases.DevNotes.AspNetCore.Services
{
    internal static class TodoCommentParser
    {
        private static readonly Regex MarkerRegex = new(
            @"^(TODO|FIXME|BUG|HACK|IDEA|FEATURE)\s*:?\s*(.*)$",
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
                        TryAddFromBlock(blockBuffer.ToString(), relativePath, lineNumber, detectMethodNames, lines, lineIndex, results, ref remainingCapacity);
                        blockBuffer.Clear();
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
                        TryAddFromContent(inlineBlock, relativePath, lineNumber, detectMethodNames, lines, lineIndex, results, ref remainingCapacity);
                        var afterBlock = line.Substring(blockEnd + 2);
                        if (!string.IsNullOrWhiteSpace(afterBlock))
                        {
                            TryAddFromLine(afterBlock, relativePath, lineNumber, detectMethodNames, lines, lineIndex, results, ref remainingCapacity);
                        }

                        continue;
                    }

                    inBlockComment = true;
                    blockBuffer.Clear();
                    blockBuffer.AppendLine(line);
                    continue;
                }

                TryAddFromLine(line, relativePath, lineNumber, detectMethodNames, lines, lineIndex, results, ref remainingCapacity);
            }

            return results;
        }

        private static void TryAddFromBlock(
            string blockContent,
            string relativePath,
            int endLineNumber,
            bool detectMethodNames,
            string[] lines,
            int lineIndex,
            List<ScannedNote> results,
            ref int remainingCapacity)
        {
            TryAddFromContent(blockContent, relativePath, endLineNumber, detectMethodNames, lines, lineIndex, results, ref remainingCapacity);
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
                content = trimmed[2..].TrimStart();
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
