using API_Web_Tour_Du_Lich.DTOs.Admin;
using API_Web_Tour_Du_Lich.DTOs.DiaDiem;
using API_Web_Tour_Du_Lich.DTOs.LichTrinh;
using API_Web_Tour_Du_Lich.DTOs.Tours;
using API_Web_Tour_Du_Lich.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API_Web_Tour_Du_Lich.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AdminController : ControllerBase
    {
        private readonly TourDuLichContext _context;

        public AdminController(TourDuLichContext context)
        {
            _context = context;
        }

        [HttpGet("danh-sach-don-gian")]
        public async Task<IActionResult> GetSimpleTours(
    string? search = null,
    string? sortBy = null,
    string? sortOrder = "asc",
    int page = 1,
    int pageSize = 10)
        {
            var query = _context.Tours.AsQueryable();

            // Tìm kiếm
            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(t => t.TenTour!.Contains(search));
            }

            // Sắp xếp
            query = sortBy?.ToLower() switch
            {
                "tentour" => sortOrder == "desc" ? query.OrderByDescending(t => t.TenTour) : query.OrderBy(t => t.TenTour),
                "giatour" => sortOrder == "desc" ? query.OrderByDescending(t => t.GiaTour) : query.OrderBy(t => t.GiaTour),
                _ => query.OrderBy(t => t.MaTour) // mặc định
            };

            // Tổng số dòng
            var totalItems = await query.CountAsync();

            // Phân trang
            var tours = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(t => new TourSimpleDto
                {
                    MaTour = t.MaTour,
                    TenTour = t.TenTour,
                    SoLuong = t.SoLuong,
                    GiaTour = t.GiaTour,
                    HinhAnh = t.HinhAnh,
                    MaDiaDiem = t.MaDiaDiem
                })
                .ToListAsync();

            return Ok(new
            {
                totalItems,
                currentPage = page,
                pageSize,
                data = tours
            });
        }

        [HttpPost("them")]
        public async Task<IActionResult> ThemTour([FromBody] TourCreateUpdateDto dto)
        {
            // Validate dữ liệu đầu vào
            if (string.IsNullOrEmpty(dto.MaTour) || string.IsNullOrEmpty(dto.TenTour))
                return BadRequest(new { message = "Mã tour và tên tour không được để trống" });

            if (dto.SoLuong <= 0)
                return BadRequest(new { message = "Số lượng phải lớn hơn 0" });

            if (dto.GiaTour <= 0)
                return BadRequest(new { message = "Giá tour phải lớn hơn 0" });

            // Kiểm tra mã tour đã tồn tại chưa
            if (await _context.Tours.AnyAsync(t => t.MaTour == dto.MaTour))
                return BadRequest(new { message = "Mã tour đã tồn tại" });

            // Kiểm tra địa điểm có tồn tại không
            if (!string.IsNullOrEmpty(dto.MaDiaDiem))
            {
                var diaDiem = await _context.DiaDiems.FindAsync(dto.MaDiaDiem);
                if (diaDiem == null)
                    return BadRequest(new { message = "Địa điểm không tồn tại" });
            }

            var tour = new Tour
            {
                MaTour = dto.MaTour,
                TenTour = dto.TenTour,
                SoLuong = dto.SoLuong,
                GiaTour = dto.GiaTour,
                HinhAnh = dto.HinhAnh,
                MaDiaDiem = dto.MaDiaDiem
            };

            _context.Tours.Add(tour);
            await _context.SaveChangesAsync();

            // Load thông tin địa điểm để trả về
            await _context.Entry(tour)
                .Reference(t => t.MaDiaDiemNavigation)
                .LoadAsync();

            return Ok(new 
            { 
                message = "Thêm tour thành công",
                tour = new
                {
                    tour.MaTour,
                    tour.TenTour,
                    tour.SoLuong,
                    tour.GiaTour,
                    tour.HinhAnh,
                    DiaDiem = tour.MaDiaDiemNavigation != null ? new
                    {
                        tour.MaDiaDiemNavigation.MaDiaDiem,
                        tour.MaDiaDiemNavigation.TenDiaDiem,
                        tour.MaDiaDiemNavigation.DiaChi
                    } : null
                }
            });
        }

        [HttpPut("sua/{maTour}")]
        public async Task<IActionResult> SuaTour(string maTour, [FromBody] TourCreateUpdateDto dto)
        {
            // Validate dữ liệu đầu vào
            if (string.IsNullOrEmpty(dto.TenTour))
                return BadRequest(new { message = "Tên tour không được để trống" });

            if (dto.SoLuong <= 0)
                return BadRequest(new { message = "Số lượng phải lớn hơn 0" });

            if (dto.GiaTour <= 0)
                return BadRequest(new { message = "Giá tour phải lớn hơn 0" });

            var tour = await _context.Tours.FindAsync(maTour);
            if (tour == null) 
                return NotFound("Không tìm thấy tour");

            // Kiểm tra địa điểm có tồn tại không
            if (!string.IsNullOrEmpty(dto.MaDiaDiem))
            {
                var diaDiem = await _context.DiaDiems.FindAsync(dto.MaDiaDiem);
                if (diaDiem == null)
                    return BadRequest(new { message = "Địa điểm không tồn tại" });
            }

            tour.TenTour = dto.TenTour;
            tour.SoLuong = dto.SoLuong;
            tour.GiaTour = dto.GiaTour;
            tour.HinhAnh = dto.HinhAnh;
            tour.MaDiaDiem = dto.MaDiaDiem;

            await _context.SaveChangesAsync();

            // Load thông tin địa điểm để trả về
            await _context.Entry(tour)
                .Reference(t => t.MaDiaDiemNavigation)
                .LoadAsync();

            return Ok(new 
            { 
                message = "Cập nhật tour thành công",
                tour = new
                {
                    tour.MaTour,
                    tour.TenTour,
                    tour.SoLuong,
                    tour.GiaTour,
                    tour.HinhAnh,
                    DiaDiem = tour.MaDiaDiemNavigation != null ? new
                    {
                        tour.MaDiaDiemNavigation.MaDiaDiem,
                        tour.MaDiaDiemNavigation.TenDiaDiem,
                        tour.MaDiaDiemNavigation.DiaChi
                    } : null
                }
            });
        }

        [HttpDelete("xoa/{maTour}")]
        public async Task<IActionResult> XoaTour(string maTour)
        {
            var tour = await _context.Tours.FindAsync(maTour);
            if (tour == null) return NotFound("Không tìm thấy tour");

            bool daCoDangKy = await _context.CtdangKies.AnyAsync(ct => ct.MaTour == maTour);
            if (daCoDangKy)
                return BadRequest(new { message = "Không thể xoá tour vì đã có người đăng ký" });

            _context.Tours.Remove(tour);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Xoá tour thành công" });
        }

        [HttpGet("danhsach-lichtrinh")]
        public async Task<IActionResult> GetLichTrinhs(
    string? search,
    string? sortBy = "NgayBd",
    bool isAsc = true,
    int page = 1,
    int pageSize = 10)
        {
            var query = _context.LichTrinhs.AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(l => l.MoTa!.Contains(search) || l.MaTour!.Contains(search));
            }

            // Sắp xếp
            query = sortBy switch
            {
                "NgayKt" => isAsc ? query.OrderBy(l => l.NgayKt) : query.OrderByDescending(l => l.NgayKt),
                "MaTour" => isAsc ? query.OrderBy(l => l.MaTour) : query.OrderByDescending(l => l.MaTour),
                _ => isAsc ? query.OrderBy(l => l.NgayBd) : query.OrderByDescending(l => l.NgayBd)
            };

            var total = await query.CountAsync();
            var data = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(l => new
                {
                    l.MaLt,
                    l.MaTour,
                    l.NgayBd,
                    l.NgayKt,
                    l.MoTa
                }).ToListAsync();

            return Ok(new { total, data });
        }

        [HttpPost("them-lichtrinh")]
        public async Task<IActionResult> ThemLichTrinh([FromBody] LichTrinhSimpleDto dto)
        {
            if (await _context.LichTrinhs.AnyAsync(l => l.MaLt == dto.MaLt))
                return BadRequest(new { message = "Mã lịch trình đã tồn tại" });

            var tour = await _context.Tours.FindAsync(dto.MaTour);
            if (tour == null)
            {
                return BadRequest(new { message = $"Tour với mã {dto.MaTour} không tồn tại." });
            }

            var lichTrinh = new LichTrinh
            {
                MaLt = dto.MaLt,
                MaTour = dto.MaTour,
                NgayBd = dto.NgayBd,
                NgayKt = dto.NgayKt,
                MoTa = dto.MoTa
            };

            _context.LichTrinhs.Add(lichTrinh);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Thêm lịch trình thành công" });
        }

        [HttpPut("sua-lichtrinh/{maLt}")]
        public async Task<IActionResult> SuaLichTrinh(string maLt, [FromBody] LichTrinhSimpleDto dto)
        {
            var lichTrinh = await _context.LichTrinhs.FindAsync(maLt);
            if (lichTrinh == null) return NotFound("Không tìm thấy lịch trình");

            lichTrinh.MaTour = dto.MaTour;
            lichTrinh.NgayBd = dto.NgayBd;
            lichTrinh.NgayKt = dto.NgayKt;
            lichTrinh.MoTa = dto.MoTa;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Cập nhật lịch trình thành công" });
        }

        [HttpDelete("xoa-lichtrinh/{maLt}")]
        public async Task<IActionResult> XoaLichTrinh(string maLt)
        {
            var lichTrinh = await _context.LichTrinhs.FindAsync(maLt);
            if (lichTrinh == null) return NotFound("Không tìm thấy lịch trình");

            _context.LichTrinhs.Remove(lichTrinh);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Xoá lịch trình thành công" });
        }

        // ✅ Lấy danh sách địa điểm
        [HttpGet("danh-sach-dia-diem")]
        public async Task<IActionResult> GetAll([FromQuery] string? search,
            [FromQuery] string? sortBy = "TenDiaDiem", 
            [FromQuery] bool isAsc = true,
            [FromQuery] int page = 1, 
            [FromQuery] int pageSize = 10)
        {
            var query = _context.DiaDiems
                .Include(d => d.Tours)
                .AsQueryable();

            // Tìm kiếm
            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(d => 
                    d.TenDiaDiem!.Contains(search) || 
                    d.DiaChi!.Contains(search) ||
                    d.MaDiaDiem.Contains(search)
                );
            }

            // Sắp xếp
            query = sortBy?.ToLower() switch
            {
                "tendiadien" => isAsc 
                    ? query.OrderBy(d => d.TenDiaDiem) 
                    : query.OrderByDescending(d => d.TenDiaDiem),
                "diachi" => isAsc 
                    ? query.OrderBy(d => d.DiaChi) 
                    : query.OrderByDescending(d => d.DiaChi),
                "sotour" => isAsc 
                    ? query.OrderBy(d => d.Tours.Count) 
                    : query.OrderByDescending(d => d.Tours.Count),
                _ => query.OrderBy(d => d.MaDiaDiem)
            };

            var total = await query.CountAsync();
            var items = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(d => new
                {
                    d.MaDiaDiem,
                    d.TenDiaDiem,
                    d.DiaChi,
                    SoTour = d.Tours.Count,
                    DanhSachTour = d.Tours.Select(t => new
                    {
                        t.MaTour,
                        t.TenTour,
                        t.GiaTour
                    }).ToList()
                })
                .ToListAsync();

            return Ok(new 
            { 
                total, 
                page, 
                pageSize,
                totalPages = (int)Math.Ceiling(total / (double)pageSize),
                items 
            });
        }

        // ✅ Thêm địa điểm
        [HttpPost("them-diadiem")]
        public async Task<IActionResult> Create(DiaDiemDto dto)
        {
            if (await _context.DiaDiems.AnyAsync(d => d.MaDiaDiem == dto.MaDiaDiem))
                return BadRequest(new { message = "Mã địa điểm đã tồn tại" });

            var diaDiem = new DiaDiem
            {
                MaDiaDiem = dto.MaDiaDiem,
                TenDiaDiem = dto.TenDiaDiem,
                DiaChi = dto.DiaChi
            };

            _context.DiaDiems.Add(diaDiem);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Thêm địa điểm thành công" });
        }

        // ✅ Cập nhật địa điểm
        [HttpPut("cap-nhat-diadiem/{maDiaDiem}")]
        public async Task<IActionResult> Update(string maDiaDiem, DiaDiemDto dto)
        {
            var diaDiem = await _context.DiaDiems.FindAsync(maDiaDiem);
            if (diaDiem == null) 
                return NotFound("Không tìm thấy địa điểm");

            diaDiem.TenDiaDiem = dto.TenDiaDiem;
            diaDiem.DiaChi = dto.DiaChi;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Cập nhật địa điểm thành công" });
        }

        // ✅ Xoá địa điểm
        [HttpDelete("xoa-diadiem/{maDiaDiem}")]
        public async Task<IActionResult> Delete(string maDiaDiem)
        {
            var diaDiem = await _context.DiaDiems
                .Include(d => d.Tours)
                .FirstOrDefaultAsync(d => d.MaDiaDiem == maDiaDiem);

            if (diaDiem == null) 
                return NotFound("Không tìm thấy địa điểm");

            if (diaDiem.Tours.Any())
                return BadRequest(new { message = "Không thể xoá địa điểm vì đang có tour sử dụng" });

            _context.DiaDiems.Remove(diaDiem);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Xoá địa điểm thành công" });
        }

    }
}
