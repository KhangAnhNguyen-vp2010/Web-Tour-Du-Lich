using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using API_Web_Tour_Du_Lich.DTOs.Auth;
using API_Web_Tour_Du_Lich.Services;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System.Data;

namespace API_Web_Tour_Du_Lich.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class Auth : ControllerBase
    {
        private static Dictionary<string, string> _refreshTokens = new(); // demo lưu refreshToken theo username
        private readonly JwtService _jwtService;
        private readonly IConfiguration _configuration;

        public Auth(JwtService jwtService, IConfiguration configuration)
        {
            _configuration = configuration;
            _jwtService = jwtService;
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] Login request)
        {
            int loginResult = -1;

            // Gọi stored procedure
            using (var connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection")))
            {
                using (var command = new SqlCommand("DangNhap", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("@TenTaiKhoan", request.Username);
                    command.Parameters.AddWithValue("@MatKhau", request.Password);

                    connection.Open();
                    using (var reader = command.ExecuteReader())
                    {
                        if (reader.Read())
                        {
                            loginResult = reader.GetInt32(0); // Đọc giá trị từ SELECT @IsValid AS KetQuaDangNhap;
                        }
                    }
                }
            }

            if (loginResult == 1)
            {
                var accessToken = _jwtService.GenerateAccessToken(request.Username);
                var refreshToken = _jwtService.GenerateRefreshToken();

                _refreshTokens[request.Username] = refreshToken;

                return Ok(new AuthResponse
                {
                    AccessToken = accessToken,
                    RefreshToken = refreshToken,
                    Username = request.Username
                });
            }

            return Unauthorized(new { Message = "Tên tài khoản hoặc mật khẩu không đúng" });
        }

        [HttpPost("register")]
        public IActionResult Register([FromBody] Register request)
        {
            int result = -1;

            using (var connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection")))
            {
                using (var command = new SqlCommand("DangKyTaiKhoan", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("@TenTaiKhoan", request.Username);
                    command.Parameters.AddWithValue("@MatKhau", request.Password);

                    connection.Open();
                    using (var reader = command.ExecuteReader())
                    {
                        if (reader.Read())
                        {
                            result = reader.GetInt32(0); // KetQuaDangKy: 1 = OK, 0 = đã tồn tại
                        }
                    }
                }
            }

            if (result == 1)
            {
                return Ok(new { message = "Đăng ký thành công!" });
            }

            return BadRequest(new { message = "Tên tài khoản đã tồn tại!" });
        }

        [HttpPost("refresh-token")]
        public IActionResult RefreshToken([FromBody] RefreshTokenRequest request)
        {
            var user = _refreshTokens.FirstOrDefault(x => x.Value == request.RefreshToken);
            if (user.Key != null)
            {
                var newAccessToken = _jwtService.GenerateAccessToken(user.Key);
                var newRefreshToken = _jwtService.GenerateRefreshToken();

                _refreshTokens[user.Key] = newRefreshToken;

                return Ok(new AuthResponse
                {
                    AccessToken = newAccessToken,
                    RefreshToken = newRefreshToken,
                    Username = user.Key
                });
            }

            return Unauthorized(new { Message = "Invalid refresh token" });
        }

        [HttpPost("logout")]
        public IActionResult Logout([FromBody] string username)
        {
            if (_refreshTokens.ContainsKey(username))
            {
                _refreshTokens.Remove(username);
            }

            return Ok(new { Message = "Logged out successfully" });
        }

        [HttpPost("check-account")]
        public IActionResult CheckAccount([FromBody] string username)
        {
            int result = -1;

            using (var connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection")))
            {
                using (var command = new SqlCommand("KiemTraTaiKhoanChuaGanKhachHang", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("@TenTaiKhoan", username);

                    connection.Open();
                    using (var reader = command.ExecuteReader())
                    {
                        if (reader.Read())
                        {
                            result = reader.GetInt32(0); // 0: chưa gán, 1: đã gán
                        }
                    }
                }
            }

            return Ok(new { daGanKhachHang = result == 1 });
        }
    }
}
