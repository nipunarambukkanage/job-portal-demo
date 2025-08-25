FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ../../ .
RUN dotnet restore JobPortal.sln
RUN dotnet publish src/JobPortal.Background/JobPortal.Background.csproj -c Release -o /app

FROM mcr.microsoft.com/dotnet/runtime:8.0
WORKDIR /app
COPY --from=build /app .
ENTRYPOINT ["dotnet","JobPortal.Background.dll"]
