using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataLibrary.Migrations
{
    /// <inheritdoc />
    public partial class test : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Pictures_AspNetUsers_ProfileId",
                table: "Pictures");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Pictures",
                table: "Pictures");

            migrationBuilder.RenameTable(
                name: "Pictures",
                newName: "PictureModel");

            migrationBuilder.RenameIndex(
                name: "IX_Pictures_ProfileId",
                table: "PictureModel",
                newName: "IX_PictureModel_ProfileId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_PictureModel",
                table: "PictureModel",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_PictureModel_AspNetUsers_ProfileId",
                table: "PictureModel",
                column: "ProfileId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PictureModel_AspNetUsers_ProfileId",
                table: "PictureModel");

            migrationBuilder.DropPrimaryKey(
                name: "PK_PictureModel",
                table: "PictureModel");

            migrationBuilder.RenameTable(
                name: "PictureModel",
                newName: "Pictures");

            migrationBuilder.RenameIndex(
                name: "IX_PictureModel_ProfileId",
                table: "Pictures",
                newName: "IX_Pictures_ProfileId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Pictures",
                table: "Pictures",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Pictures_AspNetUsers_ProfileId",
                table: "Pictures",
                column: "ProfileId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
