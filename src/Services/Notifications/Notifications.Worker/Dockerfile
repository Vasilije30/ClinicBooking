FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY src/BuildingBlocks/Contracts/Contracts.csproj src/BuildingBlocks/Contracts/
COPY src/Services/Notifications/Notifications.Worker/Notifications.Worker.csproj src/Services/Notifications/Notifications.Worker/
RUN dotnet restore src/Services/Notifications/Notifications.Worker/Notifications.Worker.csproj
COPY src/ src/
RUN dotnet publish src/Services/Notifications/Notifications.Worker/Notifications.Worker.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/runtime:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "Notifications.Worker.dll"]