namespace DevNotes.TestApp.Services;

/// <summary>
/// Sample service with developer comments for testing the DevNotes TODO scanner.
/// Open /devnotes and click "Scan Project" to import these as notes.
/// </summary>
public class ScannerSampleService
{
    // TODO: Refactor authentication logic

    public void CreateUser(string email, string password)
    {
        // TODO: validate email format before persisting
        _ = email;
        _ = password;
    }

    public async Task<bool> SignInAsync(string email, string password, CancellationToken cancellationToken = default)
    {
        // BUG: Token refresh fails sometimes when session is near expiry
        await Task.Delay(1, cancellationToken);
        return !string.IsNullOrWhiteSpace(email);
    }

    public void RefreshToken(string refreshToken)
    {
        // FIXME: Memory leak when refresh token is reused
        _ = refreshToken;
    }

    public string GetCachedResponse(string cacheKey)
    {
        // HACK: Temporary workaround until distributed cache is wired up
        return cacheKey;
    }

    public void ConfigureCaching()
    {
        /*
         * IDEA:
         * Improve caching with response compression and ETag support
         */
    }

    public void ExportNotes()
    {
        // FEATURE: Add export to CSV and Markdown formats
    }

    /* TODO:
       Consolidate duplicate validation rules across endpoints
    */

    public IReadOnlyList<string> ListPendingTasks()
    {
        // TODO: Return only tasks assigned to the current user
        return Array.Empty<string>();
    }
}
