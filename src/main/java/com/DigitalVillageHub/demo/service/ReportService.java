package com.DigitalVillageHub.demo.service;

import com.DigitalVillageHub.demo.model.entity.Report;
import com.DigitalVillageHub.demo.model.entity.User;
import com.DigitalVillageHub.demo.persistence.ReportRepository;
import com.DigitalVillageHub.demo.persistence.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;

    public List<Report> getAllReports() {
        return reportRepository.findAll();
    }

    public Report getReportById(Long id) {
        return reportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Laporan tidak ditemukan"));
    }

    public List<Report> getReportsByUserId(Long userId) {
        return reportRepository.findByUserId(userId);
    }

    public List<Report> getReportsByStatus(String status) {
        return reportRepository.findByStatus(status);
    }

    public Report createReport(Long userId, Report report) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User tidak ditemukan"));

        report.setUser(user);

        if (report.getPriority() == null || report.getPriority().isBlank()) {
            report.setPriority("HIGH");
        }

        if (report.getStatus() == null || report.getStatus().isBlank()) {
            report.setStatus("BARU");
        }

        report.setCreatedAt(LocalDateTime.now());

        return reportRepository.save(report);
    }

    public Report updateReport(Long id, Report updatedReport) {
        Report report = getReportById(id);

        report.setTitle(updatedReport.getTitle());
        report.setDescription(updatedReport.getDescription());
        report.setLocation(updatedReport.getLocation());
        report.setPriority(updatedReport.getPriority());
        report.setStatus(updatedReport.getStatus());

        return reportRepository.save(report);
    }

    public Report updateStatus(Long id, String status) {
        Report report = getReportById(id);
        report.setStatus(status);

        return reportRepository.save(report);
    }

    public void deleteReport(Long id) {
        Report report = getReportById(id);
        reportRepository.delete(report);
    }
}