using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace Phases.DevNotes.AspNetCore.Services
{
    /// <summary>
    /// Composes a technical-book style Code Learning Guide PDF via QuestPDF.
    /// </summary>
    internal static class CodeGuidePdfDocument
    {
        private static readonly string Ink = "#1a2332";
        private static readonly string Muted = "#5b6678";
        private static readonly string Accent = "#1f4e79";
        private static readonly string Rule = "#d5dbe6";
        private static readonly string QuestionBg = "#eef3f8";
        private static readonly string QuestionBorder = "#1f4e79";
        private static readonly string ExampleBg = "#f4f7f2";
        private static readonly string ExampleBorder = "#3d6b4f";
        private static readonly string CodeBg = "#f6f7f9";
        private static readonly string CodeBorder = "#c9d0db";
        private static readonly string HighlightBg = "#fff6d8";
        private const string MonoFont = "Courier New";

        public static byte[] Generate(CodeGuidePdfDocumentModel model)
        {
            var document = Document.Create(container =>
            {
                ComposeCover(container, model);
                ComposeTableOfContents(container, model);

                foreach (var file in model.Files)
                {
                    ComposeFileChapter(container, model, file);
                }
            });

            return document.GeneratePdf();
        }

        private static void ComposeCover(IDocumentContainer container, CodeGuidePdfDocumentModel model)
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.MarginVertical(72);
                page.MarginHorizontal(56);
                page.DefaultTextStyle(TextStyle.Default.FontColor(Ink).FontSize(11));

                page.Content().Column(column =>
                {
                    column.Item().ExtendVertical().AlignMiddle().Column(inner =>
                    {
                        inner.Spacing(18);

                        inner.Item().Text(model.ProjectTitle.ToUpperInvariant())
                            .FontSize(34)
                            .FontColor(Accent)
                            .Bold()
                            .LetterSpacing(0.04f);

                        inner.Item().PaddingTop(8).LineHorizontal(2).LineColor(Accent);

                        inner.Item().PaddingTop(20).Text(model.Subtitle)
                            .FontSize(22)
                            .FontColor(Ink)
                            .SemiBold();

                        inner.Item().Text(model.ProjectKind)
                            .FontSize(13)
                            .FontColor(Muted);

                        inner.Item().PaddingTop(36).Text("Generated with DevNotes")
                            .FontSize(11)
                            .FontColor(Muted);

                        inner.Item().Text($"{model.GeneratedAtUtc:MMMM d, yyyy} UTC")
                            .FontSize(10)
                            .FontColor(Muted);
                    });
                });
            });
        }

        private static void ComposeTableOfContents(IDocumentContainer container, CodeGuidePdfDocumentModel model)
        {
            container.Page(page =>
            {
                ApplyStandardPage(page, model, "Contents");

                page.Content().Column(column =>
                {
                    column.Spacing(18);

                    column.Item().Text("Table of Contents / Code Map")
                        .FontSize(20)
                        .FontColor(Accent)
                        .Bold();

                    column.Item().LineHorizontal(1).LineColor(Rule);

                    foreach (var file in model.Files)
                    {
                        column.Item().Element(e => ComposeTocFile(e, file));
                    }
                });
            });
        }

        private static void ComposeTocFile(IContainer container, CodeGuidePdfFileModel file)
        {
            container.PaddingBottom(10).Column(column =>
            {
                column.Spacing(4);

                column.Item().Text(file.FileName)
                    .FontSize(13)
                    .FontColor(Ink)
                    .Bold();

                if (!string.Equals(file.FilePath, file.FileName, StringComparison.OrdinalIgnoreCase))
                {
                    column.Item().Text(file.FilePath)
                        .FontSize(9)
                        .FontColor(Muted);
                }

                foreach (var annotation in file.Annotations)
                {
                    column.Item().PaddingLeft(8).Row(row =>
                    {
                        row.ConstantItem(28).Text(annotation.NumberLabel)
                            .FontSize(10)
                            .FontColor(Accent)
                            .FontFamily(MonoFont);

                        row.RelativeItem().Text(annotation.Title)
                            .FontSize(10)
                            .FontColor(Ink);
                    });
                }
            });
        }

        private static void ComposeFileChapter(
            IDocumentContainer container,
            CodeGuidePdfDocumentModel model,
            CodeGuidePdfFileModel file)
        {
            container.Page(page =>
            {
                ApplyStandardPage(page, model, file.FileName);

                page.Content().Column(column =>
                {
                    column.Spacing(16);

                    column.Item().Section(file.FilePath).Text(file.FileName)
                        .FontSize(22)
                        .FontColor(Accent)
                        .Bold();

                    column.Item().Text(text =>
                    {
                        text.Span("Path: ").FontColor(Muted).FontSize(10);
                        text.Span(file.FilePath).FontColor(Ink).FontSize(10).FontFamily(MonoFont);
                    });

                    column.Item().Element(e => ComposeFileCodeMap(e, file));

                    foreach (var annotation in file.Annotations)
                    {
                        column.Item().Element(e => ComposeAnnotation(e, annotation));
                    }
                });
            });
        }

        private static void ComposeFileCodeMap(IContainer container, CodeGuidePdfFileModel file)
        {
            container.Border(1).BorderColor(Rule).Background(Colors.White).Padding(12).Column(column =>
            {
                column.Spacing(6);
                column.Item().Text("Code Map")
                    .FontSize(11)
                    .FontColor(Accent)
                    .SemiBold()
                    .LetterSpacing(0.06f);

                column.Item().LineHorizontal(1).LineColor(Rule);

                foreach (var annotation in file.Annotations)
                {
                    column.Item().Row(row =>
                    {
                        row.ConstantItem(28).Text(annotation.NumberLabel)
                            .FontFamily(MonoFont)
                            .FontSize(10)
                            .FontColor(Accent);

                        row.RelativeItem().Text(annotation.Title)
                            .FontSize(10)
                            .FontColor(Ink);

                        if (annotation.LineNumber is > 0)
                        {
                            row.ConstantItem(64).AlignRight().Text($"Line {annotation.LineNumber}")
                                .FontSize(9)
                                .FontColor(Muted);
                        }
                    });
                }
            });
        }

        private static void ComposeAnnotation(IContainer container, CodeGuidePdfAnnotationModel annotation)
        {
            container.PaddingTop(10).Column(column =>
            {
                column.Spacing(10);

                column.Item().Section($"{annotation.FilePath}::{annotation.NumberLabel}")
                    .Text($"{annotation.NumberLabel}  ·  {annotation.Title}")
                    .FontSize(16)
                    .FontColor(Ink)
                    .Bold();

                column.Item().Text(BuildLocationLabel(annotation))
                    .FontSize(9)
                    .FontColor(Muted);

                column.Item().LineHorizontal(1).LineColor(Rule);

                foreach (var section in annotation.Sections)
                {
                    if (string.Equals(section.Key, "example", StringComparison.OrdinalIgnoreCase))
                    {
                        column.Item().Element(e => ComposeExampleBlock(e, section));
                    }
                    else
                    {
                        column.Item().Element(e => ComposeQuestionAnswer(e, section));
                    }
                }

                if (annotation.RelatedCode is { Lines.Count: > 0 })
                {
                    column.Item().Element(e => ComposeRelatedCode(e, annotation.RelatedCode));
                }
            });
        }

        private static void ComposeQuestionAnswer(IContainer container, CodeGuideLearningSection section)
        {
            container.Column(column =>
            {
                column.Spacing(6);

                column.Item()
                    .Border(1)
                    .BorderColor(QuestionBorder)
                    .Background(QuestionBg)
                    .PaddingVertical(8)
                    .PaddingHorizontal(12)
                    .Text(section.Question.ToUpperInvariant())
                    .FontSize(10)
                    .FontColor(Accent)
                    .SemiBold()
                    .LetterSpacing(0.04f);

                column.Item()
                    .PaddingLeft(4)
                    .Text(section.Answer)
                    .FontSize(11)
                    .FontColor(Ink)
                    .LineHeight(1.45f);
            });
        }

        private static void ComposeExampleBlock(IContainer container, CodeGuideLearningSection section)
        {
            container.Column(column =>
            {
                column.Spacing(6);

                column.Item()
                    .Border(1)
                    .BorderColor(ExampleBorder)
                    .Background(ExampleBg)
                    .PaddingVertical(8)
                    .PaddingHorizontal(12)
                    .Text("EXAMPLE")
                    .FontSize(10)
                    .FontColor(ExampleBorder)
                    .SemiBold()
                    .LetterSpacing(0.05f);

                column.Item()
                    .Border(1)
                    .BorderColor(ExampleBorder)
                    .Background(Colors.White)
                    .Padding(10)
                    .Text(section.Answer)
                    .FontFamily(MonoFont)
                    .FontSize(9.5f)
                    .FontColor(Ink)
                    .LineHeight(1.4f);
            });
        }

        private static void ComposeRelatedCode(IContainer container, CodeGuidePdfRelatedCodeModel relatedCode)
        {
            container.Column(column =>
            {
                column.Spacing(6);

                column.Item().Text("RELATED CODE")
                    .FontSize(10)
                    .FontColor(Muted)
                    .SemiBold()
                    .LetterSpacing(0.05f);

                column.Item()
                    .Border(1)
                    .BorderColor(CodeBorder)
                    .Background(CodeBg)
                    .Padding(8)
                    .Column(codeColumn =>
                    {
                        foreach (var line in relatedCode.Lines)
                        {
                            var background = line.Highlight ? HighlightBg : "#00000000";
                            codeColumn.Item().Background(background).Row(row =>
                            {
                                row.ConstantItem(36).AlignRight().PaddingRight(8)
                                    .Text(line.Number.ToString())
                                    .FontFamily(MonoFont)
                                    .FontSize(8)
                                    .FontColor(Muted);

                                row.RelativeItem()
                                    .Text(string.IsNullOrEmpty(line.Content) ? " " : line.Content)
                                    .FontFamily(MonoFont)
                                    .FontSize(8.5f)
                                    .FontColor(Ink);
                            });
                        }
                    });
            });
        }

        private static void ApplyStandardPage(PageDescriptor page, CodeGuidePdfDocumentModel model, string sectionLabel)
        {
            page.Size(PageSizes.A4);
            page.MarginTop(48);
            page.MarginBottom(48);
            page.MarginHorizontal(48);
            page.DefaultTextStyle(TextStyle.Default.FontColor(Ink).FontSize(11));

            page.Header().Column(column =>
            {
                column.Item().Row(row =>
                {
                    row.RelativeItem().Text(model.ProjectTitle)
                        .FontSize(9)
                        .FontColor(Muted);

                    row.ConstantItem(180).AlignRight().Text(sectionLabel)
                        .FontSize(9)
                        .FontColor(Muted);
                });

                column.Item().PaddingTop(6).LineHorizontal(1).LineColor(Rule);
                column.Item().PaddingBottom(12);
            });

            page.Footer().Column(column =>
            {
                column.Item().PaddingTop(8).LineHorizontal(1).LineColor(Rule);
                column.Item().PaddingTop(6).Row(row =>
                {
                    row.RelativeItem().Text("DevNotes · Code Learning Guide")
                        .FontSize(8)
                        .FontColor(Muted);

                    row.ConstantItem(80).AlignRight().Text(text =>
                    {
                        text.Span("Page ").FontSize(8).FontColor(Muted);
                        text.CurrentPageNumber().FontSize(8).FontColor(Muted);
                        text.Span(" / ").FontSize(8).FontColor(Muted);
                        text.TotalPages().FontSize(8).FontColor(Muted);
                    });
                });
            });
        }

        private static string BuildLocationLabel(CodeGuidePdfAnnotationModel annotation)
        {
            var parts = new List<string> { $"Source location: {annotation.FileName}" };
            if (annotation.LineNumber is > 0)
            {
                parts.Add($"Line {annotation.LineNumber}");
            }

            if (!string.IsNullOrWhiteSpace(annotation.MethodName))
            {
                parts.Add(annotation.MethodName);
            }

            return string.Join(" · ", parts);
        }
    }
}
