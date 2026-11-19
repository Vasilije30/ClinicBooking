FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY src/BuildingBlocks/Contracts/Contracts.csproj src/BuildingBlocks/Contracts/
COPY src/Services/Scheduling/Scheduling.Api/Scheduling.Api.csproj src/Services/Scheduling/Scheduling.Api/
RUN dotnet restore src/Services/Scheduling/Scheduling.Api/Scheduling.Api.csproj
COPY src/ src/
RUN dotnet publish src/Services/Scheduling/Scheduling.Api/Scheduling.Api.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
RUN apt-get update && apt-get install -y --no-install-recommends libgssapi-krb5-2 && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "Scheduling.Api.dll"]