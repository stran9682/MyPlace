using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataLibrary.Migrations
{
    /// <inheritdoc />
    public partial class requeststates : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Matches_SenderId",
                table: "Matches");

            migrationBuilder.CreateIndex(
                name: "IX_Matches_SenderId_ReceiverId",
                table: "Matches",
                columns: new[] { "SenderId", "ReceiverId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Matches_SenderId_ReceiverId",
                table: "Matches");

            migrationBuilder.CreateIndex(
                name: "IX_Matches_SenderId",
                table: "Matches",
                column: "SenderId");
        }
    }
}
