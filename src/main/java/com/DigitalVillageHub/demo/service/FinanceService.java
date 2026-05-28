package com.DigitalVillageHub.demo.service;

import com.DigitalVillageHub.demo.model.entity.Finance;
import com.DigitalVillageHub.demo.persistence.FinanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FinanceService {

    private final FinanceRepository financeRepository;

    public List<Finance> getAllFinances() {
        return financeRepository.findAll();
    }

    public Finance getFinanceById(Long id) {
        return financeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Data keuangan tidak ditemukan"));
    }

    public List<Finance> getFinancesByType(String type) {
        return financeRepository.findByType(type);
    }

    public List<Finance> getFinancesByCategory(String category) {
        return financeRepository.findByCategory(category);
    }

    public Finance createFinance(Finance finance) {
        if (finance.getTransactionDate() == null) {
            finance.setTransactionDate(LocalDate.now());
        }

        if (finance.getCurrentBalance() == null) {
            finance.setCurrentBalance(BigDecimal.ZERO);
        }

        return financeRepository.save(finance);
    }

    public Finance updateFinance(Long id, Finance updatedFinance) {
        Finance finance = getFinanceById(id);

        finance.setTitle(updatedFinance.getTitle());
        finance.setType(updatedFinance.getType());
        finance.setAmount(updatedFinance.getAmount());
        finance.setCategory(updatedFinance.getCategory());
        finance.setRecipient(updatedFinance.getRecipient());
        finance.setEvidenceUrl(updatedFinance.getEvidenceUrl());
        finance.setCurrentBalance(updatedFinance.getCurrentBalance());
        finance.setTransactionDate(updatedFinance.getTransactionDate());

        return financeRepository.save(finance);
    }

    public void deleteFinance(Long id) {
        Finance finance = getFinanceById(id);
        financeRepository.delete(finance);
    }
}