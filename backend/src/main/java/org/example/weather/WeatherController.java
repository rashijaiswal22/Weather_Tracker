package org.example.weather;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import java.util.Map;
@CrossOrigin(origins="*")
@RestController
@RequestMapping("/api/weather")
public class WeatherController {

    @Autowired
    private SearchHistoryRepository repository;

    @Value("${weather.api.key}")
    private String apiKey;

    private RestTemplate restTemplate = new RestTemplate();

    @GetMapping("/{city}")
    public Object getWeather(@PathVariable String city) {
        System.out.println("Backend received request for: " + city);
        String url = "https://api.openweathermap.org/data/2.5/weather?q=" + city.trim() + "&appid=" + apiKey.trim() + "&units=metric";

        try {
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            if (response != null && response.containsKey("main")) {
                Map<String, Object> main = (Map<String, Object>) response.get("main");
                Double temp = Double.parseDouble(main.get("temp").toString());

                java.util.List weatherList = (java.util.List) response.get("weather");
                String desc = ((Map<String, Object>) weatherList.get(0)).get("description").toString();

                repository.save(new SearchHistory(city, temp, desc));
                System.out.println("Data saved successfully!");
                return response;
            }
        } catch (Exception e) {
            System.out.println("API Error: " + e.getMessage());
        }
        // Fallback agar API fail ho jaye
        return Map.of("error", "Invalid API Key or Issue");
    }

    @GetMapping("/history")
    public java.util.List<SearchHistory> getHistory() {
        return repository.findTop10ByOrderBySearchTimeDesc();
    }


}