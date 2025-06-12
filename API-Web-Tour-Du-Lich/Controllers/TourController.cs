using API_Web_Tour_Du_Lich.DTOs.DiaDiem;
using API_Web_Tour_Du_Lich.DTOs.Tours;
using API_Web_Tour_Du_Lich.Models;
using API_Web_Tour_Du_Lich.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API_Web_Tour_Du_Lich.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TourController : ControllerBase
    {
        private readonly TourDuLichContext _context;

        public TourController(TourDuLichContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetTours(
            string? search = null,
            string? location = null,
            string? sortBy = null,
            string? sortOrder = "asc",
            int pageNumber = 1,
            int pageSize = 10)
        {
            if (pageNumber <= 0) pageNumber = 1;
            if (pageSize <= 0) pageSize = 10;

            var query = _context.Tours
                .Include(t => t.MaDiaDiemNavigation)
                .AsQueryable();

            // Tìm kiếm theo tên tour hoặc mô tả
            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(t => 
                    (t.TenTour != null && t.TenTour.Contains(search)) ||
                    (t.MaDiaDiemNavigation != null && 
                     (t.MaDiaDiemNavigation.TenDiaDiem.Contains(search) || 
                      t.MaDiaDiemNavigation.DiaChi.Contains(search)))
                );
            }

            // Lọc theo địa điểm
            if (!string.IsNullOrEmpty(location))
            {
                query = query.Where(t => 
                    t.MaDiaDiemNavigation != null && 
                    (t.MaDiaDiemNavigation.MaDiaDiem.Contains(location))
                );
            }

            // Sắp xếp
            query = sortBy?.ToLower() switch
            {
                "name" => sortOrder?.ToLower() == "desc" 
                    ? query.OrderByDescending(t => t.TenTour) 
                    : query.OrderBy(t => t.TenTour),
                "price" => sortOrder?.ToLower() == "desc" 
                    ? query.OrderByDescending(t => t.GiaTour) 
                    : query.OrderBy(t => t.GiaTour),
                "quantity" => sortOrder?.ToLower() == "desc" 
                    ? query.OrderByDescending(t => t.SoLuong) 
                    : query.OrderBy(t => t.SoLuong),
                "location" => sortOrder?.ToLower() == "desc" 
                    ? query.OrderByDescending(t => t.MaDiaDiemNavigation.TenDiaDiem) 
                    : query.OrderBy(t => t.MaDiaDiemNavigation.TenDiaDiem),
                _ => query.OrderBy(t => t.MaTour)
            };

            // Tổng số bản ghi
            var totalRecords = await query.CountAsync();

            // Phân trang
            var tours = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var tourDtos = tours.Select(t => new TourDto
            {
                MaTour = t.MaTour,
                TenTour = t.TenTour,
                GiaTour = t.GiaTour,
                SoLuong = t.SoLuong,
                HinhAnh = t.HinhAnh,
                DiaDiem = t.MaDiaDiemNavigation != null ? new DiaDiemDto
                {
                    MaDiaDiem = t.MaDiaDiemNavigation.MaDiaDiem,
                    TenDiaDiem = t.MaDiaDiemNavigation.TenDiaDiem,
                    DiaChi = t.MaDiaDiemNavigation.DiaChi
                } : null
            }).ToList();

            // Trả về object chứa dữ liệu phân trang + metadata
            return Ok(new
            {
                TotalRecords = totalRecords,
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling(totalRecords / (double)pageSize),
                Data = tourDtos
            });
        }
    }
}
