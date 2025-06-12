using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace API_Web_Tour_Du_Lich.Models;

public partial class TourDuLichContext : DbContext
{
    public TourDuLichContext()
    {
    }

    public TourDuLichContext(DbContextOptions<TourDuLichContext> options)
        : base(options)
    {
    }

    public virtual DbSet<CtdangKy> CtdangKies { get; set; }

    public virtual DbSet<DiaDiem> DiaDiems { get; set; }

    public virtual DbSet<HoaDon> HoaDons { get; set; }

    public virtual DbSet<KhachHang> KhachHangs { get; set; }

    public virtual DbSet<LichTrinh> LichTrinhs { get; set; }

    public virtual DbSet<PhieuDangKy> PhieuDangKies { get; set; }

    public virtual DbSet<TaiKhoan> TaiKhoans { get; set; }

    public virtual DbSet<Tour> Tours { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseSqlServer("Server=LAPTOP-8HLF4UKP\\SQLEXPRESS;Database=PhanTichThietKe_QuanLyTour;Trusted_Connection=True;TrustServerCertificate=True");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<CtdangKy>(entity =>
        {
            entity.HasKey(e => new { e.MaPhieu, e.MaTour }).HasName("PK__CTDangKy__D285EA9D351DDD44");

            entity.ToTable("CTDangKy");

            entity.Property(e => e.MaPhieu).HasMaxLength(50);
            entity.Property(e => e.MaTour).HasMaxLength(50);
            entity.Property(e => e.MaLt)
                .HasMaxLength(50)
                .HasColumnName("MaLT");
            entity.Property(e => e.SoLuongDk).HasColumnName("SoLuongDK");

            entity.HasOne(d => d.MaLtNavigation).WithMany(p => p.CtdangKies)
                .HasForeignKey(d => d.MaLt)
                .HasConstraintName("FK_CtDangKy_LichTrinh");

            entity.HasOne(d => d.MaPhieuNavigation).WithMany(p => p.CtdangKies)
                .HasForeignKey(d => d.MaPhieu)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__CTDangKy__MaPhie__619B8048");

            entity.HasOne(d => d.MaTourNavigation).WithMany(p => p.CtdangKies)
                .HasForeignKey(d => d.MaTour)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__CTDangKy__MaTour__628FA481");
        });

        modelBuilder.Entity<DiaDiem>(entity =>
        {
            entity.HasKey(e => e.MaDiaDiem).HasName("PK__DiaDiem__F015962A174340AD");

            entity.ToTable("DiaDiem");

            entity.Property(e => e.MaDiaDiem).HasMaxLength(50);
            entity.Property(e => e.DiaChi).HasMaxLength(500);
            entity.Property(e => e.TenDiaDiem).HasMaxLength(255);
        });

        modelBuilder.Entity<HoaDon>(entity =>
        {
            entity.HasKey(e => e.MaHd).HasName("PK__HoaDon__2725A6E0E446934A");

            entity.ToTable("HoaDon");

            entity.HasIndex(e => e.MaPhieu, "UQ_HoaDon_MaPhieu").IsUnique();

            entity.Property(e => e.MaHd)
                .HasMaxLength(50)
                .HasColumnName("MaHD");
            entity.Property(e => e.MaPhieu).HasMaxLength(50);
            entity.Property(e => e.NgayLap).HasColumnType("datetime");
            entity.Property(e => e.TongTien).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.TrangThai).HasMaxLength(50);

            entity.HasOne(d => d.MaPhieuNavigation).WithOne(p => p.HoaDon)
                .HasForeignKey<HoaDon>(d => d.MaPhieu)
                .HasConstraintName("FK__HoaDon__MaPhieu__656C112C");
        });

        modelBuilder.Entity<KhachHang>(entity =>
        {
            entity.HasKey(e => e.MaKh).HasName("PK__KhachHan__2725CF1E801D6564");

            entity.ToTable("KhachHang");

            entity.HasIndex(e => e.Tentk, "UQ__KhachHan__A58DF1B8A6D58F39").IsUnique();

            entity.Property(e => e.MaKh)
                .HasMaxLength(50)
                .HasColumnName("MaKH");
            entity.Property(e => e.DiaChi).HasMaxLength(500);
            entity.Property(e => e.Email).HasMaxLength(255);
            entity.Property(e => e.Sdt)
                .HasMaxLength(20)
                .HasColumnName("SDT");
            entity.Property(e => e.TenKh)
                .HasMaxLength(255)
                .HasColumnName("TenKH");
            entity.Property(e => e.Tentk)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("TENTK");

            entity.HasOne(d => d.TentkNavigation).WithOne(p => p.KhachHang)
                .HasForeignKey<KhachHang>(d => d.Tentk)
                .HasConstraintName("FK__KhachHang__TENTK__5441852A");
        });

        modelBuilder.Entity<LichTrinh>(entity =>
        {
            entity.HasKey(e => e.MaLt).HasName("PK__LichTrin__2725C773A92DF998");

            entity.ToTable("LichTrinh");

            entity.Property(e => e.MaLt)
                .HasMaxLength(50)
                .HasColumnName("MaLT");
            entity.Property(e => e.MaTour).HasMaxLength(50);
            entity.Property(e => e.NgayBd).HasColumnName("NgayBD");
            entity.Property(e => e.NgayKt).HasColumnName("NgayKT");

            entity.HasOne(d => d.MaTourNavigation).WithMany(p => p.LichTrinhs)
                .HasForeignKey(d => d.MaTour)
                .HasConstraintName("FK__LichTrinh__MaTou__5BE2A6F2");
        });

        modelBuilder.Entity<PhieuDangKy>(entity =>
        {
            entity.HasKey(e => e.MaPhieu).HasName("PK__PhieuDan__2660BFE03BE2A6D5");

            entity.ToTable("PhieuDangKy");

            entity.Property(e => e.MaPhieu).HasMaxLength(50);
            entity.Property(e => e.MaKh)
                .HasMaxLength(50)
                .HasColumnName("MaKH");

            entity.HasOne(d => d.MaKhNavigation).WithMany(p => p.PhieuDangKies)
                .HasForeignKey(d => d.MaKh)
                .HasConstraintName("FK__PhieuDangK__MaKH__5EBF139D");
        });

        modelBuilder.Entity<TaiKhoan>(entity =>
        {
            entity.HasKey(e => e.Tentk).HasName("PK__TaiKhoan__A58DF1B938EA0A5C");

            entity.ToTable("TaiKhoan");

            entity.Property(e => e.Tentk)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("TENTK");
            entity.Property(e => e.Matkhau)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("MATKHAU");
        });

        modelBuilder.Entity<Tour>(entity =>
        {
            entity.HasKey(e => e.MaTour).HasName("PK__Tour__4E5557DEF1FC227E");

            entity.ToTable("Tour");

            entity.Property(e => e.MaTour).HasMaxLength(50);
            entity.Property(e => e.GiaTour).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.HinhAnh)
                .HasMaxLength(250)
                .IsUnicode(false);
            entity.Property(e => e.MaDiaDiem).HasMaxLength(50);
            entity.Property(e => e.TenTour).HasMaxLength(255);

            entity.HasOne(d => d.MaDiaDiemNavigation).WithMany(p => p.Tours)
                .HasForeignKey(d => d.MaDiaDiem)
                .HasConstraintName("FK_Tour_MaDiaDiem");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
