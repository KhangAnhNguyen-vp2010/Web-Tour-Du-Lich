namespace API_Web_Tour_Du_Lich.DTOs.TaiKhoan
{
    public class ChangePasswordDto
    {
        public string? UserName { get; set; }  // Tên tài khoản (Tentk)
        public string? CurrentPassword { get; set; }  // Mật khẩu cũ
        public string? NewPassword { get; set; }  // Mật khẩu mới
    }
}
