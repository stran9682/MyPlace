using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataLibrary.Migrations
{
    /// <inheritdoc />
    public partial class test4 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Sex",
                table: "ProfileAttributes");

            migrationBuilder.AddColumn<string>(
                name: "Gender",
                table: "ProfileAttributes",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Gender",
                table: "ProfileAttributes");

            migrationBuilder.AddColumn<int>(
                name: "Sex",
                table: "ProfileAttributes",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }
    }
}
