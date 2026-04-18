package org.example.weather;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name="search_history")
public class SearchHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name= "city")
    private String city;

    private Double temp;
    private String description;

    @Column(name= "search_time")
    private LocalDateTime searchTime = LocalDateTime.now();

    public SearchHistory(){}
    public SearchHistory(String city,Double temp,String description) {
        this.city = city;
        this.temp = temp;
        this.description = description;
    }
    public Long getId(){ return id; }
    public void setId(Long id) { this.id = id ; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public Double getTemp() { return temp; }
    public void setTemp(Double temp) {this.temp = temp; }

    public String getDescription() { return description; }
    public void setDescription( String description ) { this.description= description; }

    public LocalDateTime getSearchTime() { return searchTime; }
    public void setSearchTime( LocalDateTime searchTime ) { this.searchTime = searchTime; }



}
