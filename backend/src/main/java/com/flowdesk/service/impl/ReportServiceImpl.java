package com.flowdesk.service.impl;

import com.flowdesk.constant.Enums;
import com.flowdesk.dto.request.CreateReportRequest;
import com.flowdesk.dto.response.ReportDto;
import com.flowdesk.entity.Report;
import com.flowdesk.entity.User;
import com.flowdesk.exception.BusinessException;
import com.flowdesk.mapper.ReportMapper;
import com.flowdesk.repository.ReportRepository;
import com.flowdesk.service.ReportService;
import com.flowdesk.util.SecurityUtils;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class ReportServiceImpl implements ReportService {
    private final ReportRepository reportRepository;
    private final ReportMapper reportMapper;

    public ReportServiceImpl(ReportRepository reportRepository, ReportMapper reportMapper) {
        this.reportRepository = reportRepository;
        this.reportMapper = reportMapper;
    }

    @Override
    public List<ReportDto> listAll() {
        return reportMapper.toDtoList(reportRepository.findByOrganizationIdAndDeletedFalseOrderByCreatedAtDesc(requireUser().getOrganization().getId()));
    }

    @Override
    @Transactional
    public ReportDto create(CreateReportRequest request) {
        User user = requireUser();
        Report report = new Report();
        report.setTitle(request.getTitle());
        report.setType(request.getType());
        report.setDescription(request.getDescription());
        report.setScheduleCron(request.getSchedule());
        report.setStatus(Enums.ReportStatus.ready);
        report.setOrganization(user.getOrganization());
        report.setCreatedByUser(user);
        return reportMapper.toDto(reportRepository.save(report));
    }

    private User requireUser() {
        User user = SecurityUtils.getCurrentUser();
        if (user == null) throw new BusinessException("Not authenticated", HttpStatus.UNAUTHORIZED);
        return user;
    }
}
