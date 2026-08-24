package com.stockpulse.repository;

import com.stockpulse.domain.Category;
import com.stockpulse.domain.Product;
import com.stockpulse.domain.ProductStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByStatusAndCategory(ProductStatus status, Category category);
    List<Product> findByStatus(ProductStatus status);
    List<Product> findByCategory(Category category);
}
