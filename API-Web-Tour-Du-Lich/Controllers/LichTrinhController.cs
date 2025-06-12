using API_Web_Tour_Du_Lich.DTOs.LichTrinh;
using API_Web_Tour_Du_Lich.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API_Web_Tour_Du_Lich.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LichTrinhController : ControllerBase
    {
        private readonly TourDuLichContext _context;

        public LichTrinhController(TourDuLichContext context)
        {
            _context = context;
        }

        // GET: api/lichtrinh/bytour/{maTour}
        [HttpGet("bytour/{maTour}")]
        public async Task<IActionResult> GetLichTrinhByTour(string maTour)
        {
            if (string.IsNullOrEmpty(maTour))
            {
                return BadRequest("Mã tour không được để trống.");
            }

            var today = DateOnly.FromDateTime(DateTime.Today);
            var testDate = new DateOnly(2025, 6, 17); // 10/6/2025


            var lichTrinhs = await _context.LichTrinhs
                .Where(lt => lt.MaTour == maTour && today < lt.NgayBd.Value.AddDays(-3))
                .Select(lt => new LichTrinhDto
                {
                    MaLt = lt.MaLt,
                    NgayBd = lt.NgayBd,
                    NgayKt = lt.NgayKt,
                    MoTa = lt.MoTa
                })
                .ToListAsync();

            if (lichTrinhs == null || lichTrinhs.Count == 0)
            {
                return NotFound("Không tìm thấy lịch trình cho tour này.");
            }

            return Ok(lichTrinhs);
        }
    }
}
