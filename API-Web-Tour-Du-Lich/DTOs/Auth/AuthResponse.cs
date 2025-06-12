namespace API_Web_Tour_Du_Lich.DTOs.Auth
{
    public class AuthResponse
    {
        public string? AccessToken { get; set; }
        public string? RefreshToken { get; set; }
        public string? Username { get; set; }
    }
}
