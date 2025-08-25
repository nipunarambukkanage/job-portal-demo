# ----------------------------
# BUILD STAGE
# ----------------------------
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release
ENV DOTNET_CLI_TELEMETRY_OPTOUT=1 \
    NUGET_XMLDOC_MODE=skip

WORKDIR /src

# 1) Copy only project files for restore caching
COPY JobPortal.sln ./
COPY src/JobPortal.Api/JobPortal.Api.csproj src/JobPortal.Api/
COPY src/JobPortal.Application/JobPortal.Application.csproj src/JobPortal.Application/
COPY src/JobPortal.Infrastructure/JobPortal.Infrastructure.csproj src/JobPortal.Infrastructure/
COPY src/JobPortal.Domain/JobPortal.Domain.csproj src/JobPortal.Domain/

# If you keep Directory.Build.props/targets or build/global.json, copy them too:
# COPY build/Directory.Build.props build/Directory.Build.props
# COPY build/global.json build/global.json

# 2) Restore (using only csproj files above)
RUN dotnet restore src/JobPortal.Api/JobPortal.Api.csproj

# 3) Copy the full source and publish (no restore again)
COPY . ./
RUN dotnet publish src/JobPortal.Api/JobPortal.Api.csproj -c $BUILD_CONFIGURATION -o /app --no-restore

# ----------------------------
# RUNTIME STAGE
# ----------------------------
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime

# Security/diagnostics defaults
ENV ASPNETCORE_URLS=http://+:8080 \
    ASPNETCORE_ENVIRONMENT=Production \
    DOTNET_EnableDiagnostics=0

WORKDIR /app
COPY --from=build /app ./

# Create a non-root user and switch to it
# (Debian-slim base)
RUN useradd -m -u 64198 appuser && chown -R appuser /app
USER appuser

EXPOSE 8080
ENTRYPOINT ["dotnet", "JobPortal.Api.dll"]
