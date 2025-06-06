﻿using Hackathon_2025.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace Hackathon_2025.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ImageController : ControllerBase
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;

    public ImageController(IOptions<OpenAISettings> options, HttpClient httpClient)
    {
        _apiKey = options.Value.ApiKey;
        _httpClient = httpClient;
    }

    [HttpPost("generate-batch")]
    public async Task<IActionResult> GenerateImages([FromBody] ImageBatchRequest request)
    {
        if (request.Prompts == null || request.Prompts.Count == 0)
        {
            return BadRequest("Prompts list cannot be empty.");
        }

        var imageUrls = new List<string>();

        foreach (var prompt in request.Prompts)
        {
            var requestBody = new
            {
                model = "dall-e-3",
                prompt = prompt,
                n = 1,
                size = "1024x1024"
            };

            using var httpRequest = new HttpRequestMessage(HttpMethod.Post, "https://api.openai.com/v1/images/generations");
            httpRequest.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);
            httpRequest.Content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");

            var response = await _httpClient.SendAsync(httpRequest);
            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync();
                return StatusCode((int)response.StatusCode, $"Image failed for prompt: {prompt}\n{error}");
            }

            var resultJson = await JsonDocument.ParseAsync(await response.Content.ReadAsStreamAsync());
            var url = resultJson.RootElement.GetProperty("data")[0].GetProperty("url").GetString();

            imageUrls.Add(url!);
        }

        return Ok(new { imageUrls });
    }
}
