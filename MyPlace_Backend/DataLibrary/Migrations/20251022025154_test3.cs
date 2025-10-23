using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace DataLibrary.Migrations
{
    /// <inheritdoc />
    public partial class test3 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Bio",
                table: "AspNetUsers");

            migrationBuilder.CreateTable(
                name: "ProfileAttributes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ProfileId = table.Column<string>(type: "text", nullable: false),
                    Bio = table.Column<string>(type: "character varying(32767)", maxLength: 32767, nullable: false),
                    Cleanliness = table.Column<int>(type: "integer", nullable: false),
                    Personality = table.Column<int>(type: "integer", nullable: false),
                    HoursAwake = table.Column<int>(type: "integer", nullable: false),
                    Sex = table.Column<int>(type: "integer", nullable: false),
                    LikesProfiles = table.Column<string[]>(type: "text[]", nullable: false),
                    DislikesProfiles = table.Column<string[]>(type: "text[]", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProfileAttributes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProfileAttributes_AspNetUsers_ProfileId",
                        column: x => x.ProfileId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProfileProfile",
                columns: table => new
                {
                    MatchRequestsId = table.Column<string>(type: "text", nullable: false),
                    MatchesId = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProfileProfile", x => new { x.MatchRequestsId, x.MatchesId });
                    table.ForeignKey(
                        name: "FK_ProfileProfile_AspNetUsers_MatchRequestsId",
                        column: x => x.MatchRequestsId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProfileProfile_AspNetUsers_MatchesId",
                        column: x => x.MatchesId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ProfileAttributes_ProfileId",
                table: "ProfileAttributes",
                column: "ProfileId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProfileProfile_MatchesId",
                table: "ProfileProfile",
                column: "MatchesId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ProfileAttributes");

            migrationBuilder.DropTable(
                name: "ProfileProfile");

            migrationBuilder.AddColumn<string>(
                name: "Bio",
                table: "AspNetUsers",
                type: "character varying(32767)",
                maxLength: 32767,
                nullable: true);
        }
    }
}
