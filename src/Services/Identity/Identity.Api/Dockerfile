FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY src/Services/Identity/Identity.Api/Identity.Api.csproj src/Services/Identity/Identity.Api/
RUN dotnet restore src/Services/Identity/Identity.Api/Identity.Api.csproj
COPY src/ src/
RUN dotnet publish src/Services/Identity/Identity.Api/Identity.Api.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
RUN apt-get update && apt-get install -y --no-install-recommends libgssapi-krb5-2 && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "Identity.Api.dll"]