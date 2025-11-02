FROM mcr.microsoft.com/dotnet/sdk:8.0
WORKDIR /src
COPY ["MyPlaceAPI/", "MyPlaceAPI/"]
COPY ["DataLibrary/", "DataLibrary/"]

RUN dotnet tool install --global dotnet-ef
ENV PATH="$PATH:/root/.dotnet/tools"

CMD ["dotnet", "ef", "database", "update", "-s", "MyPlaceAPI", "-p", "DataLibrary"]
