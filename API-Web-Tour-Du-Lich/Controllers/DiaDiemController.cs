using API_Web_Tour_Du_Lich.DTOs.DiaDiem;
using API_Web_Tour_Du_Lich.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API_Web_Tour_Du_Lich.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DiaDiemController : ControllerBase
    {
        private readonly TourDuLichContext _context;

        public DiaDiemController(TourDuLichContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetDiaDiems()
        {
            var diaDiems = await _context.DiaDiems.ToListAsync();

            var diaDiemDtos = diaDiems.Select(d => new DiaDiemDto
            {
                MaDiaDiem = d.MaDiaDiem,
                TenDiaDiem = d.TenDiaDiem,
                DiaChi = d.DiaChi,
            }).ToList();

            return Ok(diaDiemDtos);
        }

    }
}
