package edu.entra21.fiberguardian.configuration;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

public class SameSiteCookieFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        filterChain.doFilter(request, response);

        Collection<String> headers = response.getHeaders("Set-Cookie");

        if (headers == null || headers.isEmpty()) {
            return;
        }

        List<String> newHeaders = new ArrayList<>();

        for (String header : headers) {
            String lower = header.toLowerCase();
            String updatedHeader = header;

            if ((header.startsWith("XSRF-TOKEN") || header.startsWith("JSESSIONID"))
                    && !lower.contains("samesite")) {
                updatedHeader += "; SameSite=Lax";
            }

            newHeaders.add(updatedHeader);
        }

        // Remover apenas os headers já processados
        response.setHeader("Set-Cookie", null);
        for (String newHeader : newHeaders) {
            response.addHeader("Set-Cookie", newHeader);
        }
    }
}
