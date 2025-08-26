# ---------------- BUILD ----------------
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

# copy solution and individual csproj files first (better layer caching)
COPY JobPortal.sln ./
COPY src/JobPortal.Api/JobPortal.Api.csproj src/JobPortal.Api/
COPY src/JobPortal.Application/JobPortal.Application.csproj src/JobPortal.Application/
COPY src/JobPortal.Infrastructure/JobPortal.Infrastructure.csproj src/JobPortal.Infrastructure/
COPY src/JobPortal.Domain/JobPortal.Domain.csproj src/JobPortal.Domain/

# restore at this stage
RUN dotnet restore src/JobPortal.Api/JobPortal.Api.csproj

# copy everything and restore again to avoid fallback folder issues
COPY . ./
RUN dotnet restore JobPortal.sln

# publish
RUN dotnet publish src/JobPortal.Api/JobPortal.Api.csproj -c $BUILD_CONFIGURATION -o /app

# ---------------- RUNTIME ----------------
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app .
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet","JobPortal.Api.dll"]
