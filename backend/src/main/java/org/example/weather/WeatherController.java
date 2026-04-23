package org.example.weather;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/weather")
@CrossOrigin(origins = "*", allowedHeaders = "*") // Global CORS
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

                List weatherList = (List) response.get("weather");
                String desc = ((Map<String, Object>) weatherList.get(0)).get("description").toString();

                // Database Save
                repository.save(new SearchHistory(city, temp, desc));
                return response;
            }
        } catch (Exception e) {
            System.out.println("Current Weather API Error: " + e.getMessage());
        }
        return Map.of("error", "City not found");
    }

    @GetMapping("/forecast/{city}")
    public Object getForecast(@PathVariable String city) {
        System.out.println("Fetching Forecast for: " + city);
        String url = "https://api.openweathermap.org/data/2.5/forecast?q=" + city.trim() + "&appid=" + apiKey.trim() + "&units=metric";
        try {
            return restTemplate.getForObject(url, Map.class);
        } catch (Exception e) {
            return Map.of("error", "Forecast issue: " + e.getMessage());
        }
    }

    @GetMapping("/history")
    public List<SearchHistory> getHistory() {
        return repository.findTop10ByOrderBySearchTimeDesc();
    }
}
